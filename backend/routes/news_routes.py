from flask import jsonify, request, Response
from image_cache import get_cached_image, cache_stats, clear_cache
from models import db, NewsEvent, User
from werkzeug.utils import secure_filename
from google_drive import (move_news_images_to_item_folder, upload_news_event_image, extract_drive_entry_from_url, trash_file, trash_news_item_folder)
from functools import wraps
import os
import tempfile
import traceback
import re
from datetime import datetime


def admin_required(f):
    """Decorator to check if user is admin or staff"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"detail": "Authorization required"}), 401

            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"detail": str(e)}), 401
    return decorated_function


def register_news_routes(app):

    
    @app.route('/api/news-events', methods=['GET', 'OPTIONS'])
    def get_public_news_events():
        if request.method == 'OPTIONS':
            return jsonify({})

        try:
            item_type = request.args.get('type', 'all')
            search = request.args.get('search', '')
            limit = request.args.get('limit', type=int)
            featured_only = request.args.get('featured', 'false').lower() == 'true'

            # Strict: only published items
            query = NewsEvent.query.filter(NewsEvent.is_published.is_(True))

            if item_type and item_type.lower() != 'all':
                query = query.filter(NewsEvent.type == item_type.upper())

            if search:
                search_pattern = f'%{search}%'
                query = query.filter(
                    db.or_(
                        NewsEvent.title.ilike(search_pattern),
                        NewsEvent.excerpt.ilike(search_pattern)
                    )
                )

            if featured_only:
                query = query.filter(NewsEvent.is_featured.is_(True))

            query = query.order_by(db.desc(db.func.coalesce(NewsEvent.event_start_date, NewsEvent.created_at)))

            if limit:
                query = query.limit(limit)

            items = query.all()
            return jsonify([item.to_dict() for item in items]), 200

        except Exception as e:
            print(f"Error fetching news/events: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500

    @app.route('/api/news-events/<int:item_id>', methods=['GET', 'OPTIONS'])
    def get_public_news_event(item_id):
        """Public endpoint to fetch a single news/event by ID"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            item = NewsEvent.query.get(item_id)
            if not item:
                return jsonify({"detail": "News/Event not found"}), 404
            
            if not item.is_published:
                return jsonify({"detail": "News/Event not found"}), 404
            
            # Increment view count
            item.views_count = (item.views_count or 0) + 1
            db.session.commit()
            
            return jsonify(item.to_dict()), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error fetching news/event: {e}")
            return jsonify({"detail": str(e)}), 500

    @app.route('/api/news-image/<file_id>', methods=['GET', 'OPTIONS'])
    def serve_news_image(file_id):
        """
        Serve a news/event image through the cache.
        Uses a larger thumbnail size (w1600) since news cards show bigger images.
        """
        if request.method == 'OPTIONS':
            return jsonify({})

        try:
            size = request.args.get('size', 'w1600')
            data, mime = get_cached_image(file_id, size=size)
            resp = Response(data, mimetype=mime)
            resp.headers['Cache-Control'] = 'public, max-age=604800, immutable'
            resp.headers['Content-Length'] = str(len(data))
            return resp
        except Exception as e:
            print(f"Error serving news image {file_id}: {e}")
            return jsonify({"detail": str(e)}), 404
        
    @app.route('/api/admin/news-events/cache/stats', methods=['GET', 'OPTIONS'])
    def admin_news_cache_stats():
        if request.method == 'OPTIONS':
            return jsonify({})
        return jsonify(cache_stats()), 200
    
    # ==================== ADMIN ROUTES ====================
    
    @app.route('/api/admin/news-events', methods=['GET', 'OPTIONS'])
    def admin_get_all_news_events():
        """Admin endpoint to fetch ALL news and events (including unpublished)"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            # Query parameters
            item_type = request.args.get('type', 'all')
            status = request.args.get('status', 'all')  # all, published, draft
            search = request.args.get('search', '')
            sort_by = request.args.get('sort_by', 'created_at')
            sort_order = request.args.get('sort_order', 'desc')
            
            query = NewsEvent.query
            
            if item_type and item_type.lower() != 'all':
                query = query.filter(NewsEvent.type == item_type.upper())
            
            if status == 'published':
                query = query.filter_by(is_published=True)
            elif status == 'draft':
                query = query.filter_by(is_published=False)
            
            if search:
                search_pattern = f'%{search}%'
                query = query.filter(
                    db.or_(
                        NewsEvent.title.ilike(search_pattern),
                        NewsEvent.excerpt.ilike(search_pattern),
                        NewsEvent.tag.ilike(search_pattern),
                        NewsEvent.theme.ilike(search_pattern)
                    )
                )
            
            # Sorting
            if sort_by == 'title':
                sort_column = NewsEvent.title
            elif sort_by == 'type':
                sort_column = NewsEvent.type
            elif sort_by == 'event_date':
                sort_column = NewsEvent.event_start_date
            elif sort_by == 'views':
                sort_column = NewsEvent.views_count
            else:
                sort_column = NewsEvent.created_at
            
            if sort_order == 'asc':
                query = query.order_by(sort_column.asc())
            else:
                query = query.order_by(sort_column.desc())
            
            items = query.all()
            
            return jsonify([item.to_dict() for item in items]), 200
            
        except Exception as e:
            print(f"Error fetching admin news/events: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500

    @app.route('/api/admin/news-events/<int:item_id>', methods=['GET', 'OPTIONS'])
    def admin_get_news_event(item_id):
        """Admin endpoint to fetch a single news/event by ID"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            item = NewsEvent.query.get(item_id)
            if not item:
                return jsonify({"detail": "News/Event not found"}), 404
            
            return jsonify(item.to_dict()), 200
            
        except Exception as e:
            print(f"Error fetching news/event: {e}")
            return jsonify({"detail": str(e)}), 500

    @app.route('/api/admin/news-events', methods=['POST', 'OPTIONS'])
    def admin_create_news_event():
        """Admin endpoint to create a new news/event with multiple images"""
        if request.method == 'OPTIONS':
            return jsonify({})

        temp_files = []
        temp_dir = None

        try:
            if request.content_type and 'multipart/form-data' in request.content_type:
                data = request.form.to_dict()
                image_files = request.files.getlist('images')
                image_urls_input = request.form.getlist('image_urls')
            else:
                data = request.get_json() or {}
                image_files = []
                image_urls_input = data.get('image_urls', [])

            title = data.get('title', '').strip()
            item_type = data.get('type', 'NEWS').upper()
            date_display = data.get('date_display', '').strip()
            theme = (data.get('theme') or '').strip() or None

            if not title:
                return jsonify({"detail": "Title is required"}), 400
            if item_type not in ['NEWS', 'EVENT', 'ANNOUNCEMENT']:
                return jsonify({"detail": "Invalid type. Must be NEWS, EVENT, or ANNOUNCEMENT"}), 400
            if not date_display:
                return jsonify({"detail": "Display date is required"}), 400
            if theme and len(theme) > 255:
                return jsonify({"detail": "Theme must be 255 characters or fewer"}), 400

            default_colors = {
                'NEWS': {'type_color': 'bg-yellow-100 text-yellow-800', 'tag_color': 'bg-yellow-50 text-yellow-700 border-yellow-200'},
                'EVENT': {'type_color': 'bg-blue-100 text-blue-800', 'tag_color': 'bg-blue-50 text-blue-700 border-blue-200'},
                'ANNOUNCEMENT': {'type_color': 'bg-green-100 text-green-800', 'tag_color': 'bg-green-50 text-green-700 border-green-200'}
            }

            # ── Parse event dates ──
            event_start_date = None
            event_end_date = None
            if data.get('event_start_date'):
                try:
                    event_start_date = datetime.fromisoformat(data['event_start_date'].replace('Z', '+00:00'))
                except Exception:
                    try:
                        event_start_date = datetime.strptime(data['event_start_date'], '%Y-%m-%d')
                    except Exception:
                        pass
            if data.get('event_end_date'):
                try:
                    event_end_date = datetime.fromisoformat(data['event_end_date'].replace('Z', '+00:00'))
                except Exception:
                    try:
                        event_end_date = datetime.strptime(data['event_end_date'], '%Y-%m-%d')
                    except Exception:
                        pass

            # 1️⃣ Persist the row (no images yet) so we can get an id for the folder
            new_item = NewsEvent(
                type=item_type,
                title=title,
                theme=theme if item_type == 'EVENT' else None,
                excerpt=data.get('excerpt', '').strip() or None,
                content=data.get('content', '').strip() or None,
                date_display=date_display,
                event_start_date=event_start_date,
                event_end_date=event_end_date,
                tag=data.get('tag', '').strip() or None,
                tag_color=data.get('tag_color', '').strip() or default_colors[item_type]['tag_color'],
                type_color=data.get('type_color', '').strip() or default_colors[item_type]['type_color'],
                image_urls=None,
                is_published=data.get('is_published', 'true').lower() == 'true' if isinstance(data.get('is_published'), str) else bool(data.get('is_published', True)),
                is_featured=data.get('is_featured', 'false').lower() == 'true' if isinstance(data.get('is_featured'), str) else bool(data.get('is_featured', False)),
                created_by=data.get('created_by'),
            )
            db.session.add(new_item)
            db.session.flush()   # ← assigns new_item.id without committing

            # 2️⃣ Upload images into NewsEvents/<TYPE>/<slug>-<id>/Images
            image_entries = []
            allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}

            for image_file in image_files:
                if not image_file or not image_file.filename:
                    continue
                file_ext = os.path.splitext(image_file.filename)[1].lower()
                if file_ext not in allowed_extensions:
                    db.session.rollback()
                    return jsonify({"detail": f"Invalid image format for {image_file.filename}. Allowed: JPG, PNG, GIF, WEBP, BMP"}), 400

                safe_filename = secure_filename(image_file.filename.replace(' ', '_'))
                temp_dir = tempfile.mkdtemp()
                file_path = os.path.join(temp_dir, safe_filename)
                image_file.save(file_path)
                temp_files.append(file_path)

                try:
                    entry = upload_news_event_image(file_path,f"news_{safe_filename}", item_type=new_item.type, title=new_item.title, item_id=new_item.id,)
                    image_entries.append(entry)
                    print(f"✅ Image uploaded: {entry['view_url']}")
                except Exception as drive_error:
                    print(f"⚠️ Drive upload failed for {safe_filename}: {drive_error}")

            # Pasted URLs → normalize
            for url in image_urls_input:
                if not url or not str(url).strip():
                    continue
                entry = extract_drive_entry_from_url(str(url).strip())
                if entry:
                    image_entries.append(entry)

            # Legacy singular image_url (in case an old client sends it)
            legacy_url = (data.get('image_url') or '').strip()
            if legacy_url:
                entry = extract_drive_entry_from_url(legacy_url)
                if entry:
                    image_entries.append(entry)

            # 3️⃣ Attach image entries and commit
            new_item.image_urls = image_entries or None
            db.session.commit()
            return jsonify({"message": "News/Event created successfully", "item": new_item.to_dict()}), 201

        except Exception as e:
            db.session.rollback()
            print(f"Error creating news/event: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500
        finally:
            for f in temp_files:
                try:
                    if os.path.exists(f):
                        os.remove(f)
                except Exception:
                    pass
            if temp_dir and os.path.exists(temp_dir):
                try:
                    os.rmdir(temp_dir)
                except Exception:
                    pass

    @app.route('/api/admin/news-events/<int:item_id>', methods=['PUT', 'OPTIONS'])
    def admin_update_news_event(item_id):
        """Admin endpoint to update a news/event (supports multiple images)"""
        if request.method == 'OPTIONS':
            return jsonify({})

        temp_files = []
        temp_dir = None

        try:
            item = NewsEvent.query.get(item_id)
            if not item:
                return jsonify({"detail": "News/Event not found"}), 404

            if request.content_type and 'multipart/form-data' in request.content_type:
                data = request.form.to_dict()
                image_files = request.files.getlist('images')
                image_urls_input = request.form.getlist('image_urls')
                keep_existing = request.form.get('keep_existing_images', 'true').lower() == 'true'
            else:
                data = request.get_json() or {}
                image_files = []
                image_urls_input = data.get('image_urls', [])
                keep_existing = data.get('keep_existing_images', True)

            changes = {}

            # ── Simple field updates ──
            if 'title' in data:
                new_title = data['title'].strip()
                if new_title and new_title != item.title:
                    changes['title'] = {'old': item.title, 'new': new_title}
                    item.title = new_title

            if 'type' in data:
                new_type = data['type'].upper()
                if new_type in ['NEWS', 'EVENT', 'ANNOUNCEMENT'] and new_type != item.type:
                    changes['type'] = {'old': item.type, 'new': new_type}
                    item.type = new_type
                    if 'type_color' not in data:
                        default_type_colors = {
                            'NEWS': 'bg-yellow-100 text-yellow-800',
                            'EVENT': 'bg-blue-100 text-blue-800',
                            'ANNOUNCEMENT': 'bg-green-100 text-green-800',
                        }
                        item.type_color = default_type_colors.get(new_type, item.type_color)

            if 'theme' in data:
                new_theme = data['theme'].strip() if data['theme'] else None
                if new_theme and len(new_theme) > 255:
                    return jsonify({"detail": "Theme must be 255 characters or fewer"}), 400
                # Theme only applies to events
                if item.type != 'EVENT':
                    new_theme = None
                if new_theme != item.theme:
                    changes['theme'] = {'old': item.theme, 'new': new_theme}
                    item.theme = new_theme

            if 'excerpt' in data:
                new_excerpt = data['excerpt'].strip() if data['excerpt'] else None
                if new_excerpt != item.excerpt:
                    changes['excerpt'] = {'old': item.excerpt, 'new': new_excerpt}
                    item.excerpt = new_excerpt

            if 'content' in data:
                new_content = data['content'].strip() if data['content'] else None
                if new_content != item.content:
                    changes['content'] = {'old': item.content, 'new': new_content}
                    item.content = new_content

            if 'date_display' in data:
                new_date = data['date_display'].strip()
                if new_date and new_date != item.date_display:
                    changes['date_display'] = {'old': item.date_display, 'new': new_date}
                    item.date_display = new_date

            if 'event_start_date' in data:
                try:
                    new_start = datetime.fromisoformat(data['event_start_date'].replace('Z', '+00:00')) if data['event_start_date'] else None
                except Exception:
                    try:
                        new_start = datetime.strptime(data['event_start_date'], '%Y-%m-%d') if data['event_start_date'] else None
                    except Exception:
                        new_start = None
                if new_start != item.event_start_date:
                    changes['event_start_date'] = {
                        'old': item.event_start_date.isoformat() if item.event_start_date else None,
                        'new': new_start.isoformat() if new_start else None,
                    }
                    item.event_start_date = new_start

            if 'event_end_date' in data:
                try:
                    new_end = datetime.fromisoformat(data['event_end_date'].replace('Z', '+00:00')) if data['event_end_date'] else None
                except Exception:
                    try:
                        new_end = datetime.strptime(data['event_end_date'], '%Y-%m-%d') if data['event_end_date'] else None
                    except Exception:
                        new_end = None
                if new_end != item.event_end_date:
                    changes['event_end_date'] = {
                        'old': item.event_end_date.isoformat() if item.event_end_date else None,
                        'new': new_end.isoformat() if new_end else None,
                    }
                    item.event_end_date = new_end

            if 'tag' in data:
                new_tag = data['tag'].strip() if data['tag'] else None
                if new_tag != item.tag:
                    item.tag = new_tag

            if 'tag_color' in data:
                new_tag_color = data['tag_color'].strip() if data['tag_color'] else None
                if new_tag_color != item.tag_color:
                    item.tag_color = new_tag_color

            if 'type_color' in data:
                new_type_color = data['type_color'].strip() if data['type_color'] else None
                if new_type_color != item.type_color:
                    item.type_color = new_type_color

            if 'is_published' in data:
                new_published = data['is_published'].lower() == 'true' if isinstance(data['is_published'], str) else bool(data['is_published'])
                if new_published != item.is_published:
                    item.is_published = new_published

            if 'is_featured' in data:
                new_featured = data['is_featured'].lower() == 'true' if isinstance(data['is_featured'], str) else bool(data['is_featured'])
                if new_featured != item.is_featured:
                    item.is_featured = new_featured

            existing = item.image_urls or []
            new_entries = []
            if keep_existing:
                for e in existing:
                    if isinstance(e, dict) and e.get('view_url'):
                        new_entries.append({'file_id': e.get('file_id'), 'view_url': e.get('view_url')})
                    elif isinstance(e, str):
                        entry = extract_drive_entry_from_url(e)
                        if entry:
                            new_entries.append(entry)

            # Upload new files
            allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
            for image_file in image_files:
                if not image_file or not image_file.filename:
                    continue

                file_ext = os.path.splitext(image_file.filename)[1].lower()
                if file_ext not in allowed_extensions:
                    return jsonify({"detail": f"Invalid image format for {image_file.filename}"}), 400

                safe_filename = secure_filename(image_file.filename.replace(' ', '_'))
                temp_dir = tempfile.mkdtemp()
                file_path = os.path.join(temp_dir, safe_filename)
                image_file.save(file_path)
                temp_files.append(file_path)

                try:
                    entry = upload_news_event_image(file_path, f"news_{safe_filename}", item.type)
                    new_entries.append(entry)
                except Exception as drive_error:
                    print(f"⚠️ Drive upload failed: {drive_error}")

            # Pasted URLs → normalize
            for url in image_urls_input:
                if not url or not str(url).strip():
                    continue
                entry = extract_drive_entry_from_url(str(url).strip())
                if entry and entry not in new_entries:
                    new_entries.append(entry)

            # Detect which entries were removed (to trash them)
            old_view_urls = set()
            for e in existing:
                if isinstance(e, dict) and e.get('view_url'):
                    old_view_urls.add(e['view_url'])
                elif isinstance(e, str):
                    old_view_urls.add(e)

            new_view_urls = {e['view_url'] for e in new_entries}
            removed_urls = old_view_urls - new_view_urls

            # Trash the removed Drive files
            for removed_url in removed_urls:
                entry = extract_drive_entry_from_url(removed_url)
                if entry and entry.get('file_id'):
                    try:
                        trash_file(entry['file_id'])
                        print(f"🗑️  Trashed removed image: {entry['file_id']}")
                    except Exception as trash_err:
                        print(f"⚠️ Could not trash {entry['file_id']}: {trash_err}")
                    try:
                        clear_cache(entry['file_id'])
                    except Exception as cache_err:
                        print(f"⚠️ Could not clear cache for {entry['file_id']}: {cache_err}")

            # Commit image changes
            if new_entries != existing:
                changes['image_urls'] = {'old': existing, 'new': new_entries}
                item.image_urls = new_entries if new_entries else None

            title_changed = changes.get('title') is not None
            type_changed = changes.get('type') is not None

            if (title_changed or type_changed) and item.image_urls:
                try:
                    move_news_images_to_item_folder(image_entries=item.image_urls, item_type=item.type, title=item.title, item_id=item.id,)
                except Exception as move_err:
                    print(f"⚠️ Could not move images: {move_err}")
            if changes:
                db.session.commit()
                return jsonify({
                    "message": "News/Event updated successfully",
                    "changes": changes,
                    "item": item.to_dict()
                }), 200
            else:
                return jsonify({"message": "No changes made", "item": item.to_dict()}), 200

        except Exception as e:
            db.session.rollback()
            print(f"Error updating news/event: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500
        finally:
            for f in temp_files:
                try:
                    if os.path.exists(f):
                        os.remove(f)
                except Exception:
                    pass
            if temp_dir and os.path.exists(temp_dir):
                try:
                    os.rmdir(temp_dir)
                except Exception:
                    pass
    
    @app.route('/api/admin/news-events/<int:item_id>', methods=['DELETE', 'OPTIONS'])
    def admin_delete_news_event(item_id):
        """Admin endpoint to delete a news/event and its Drive folder"""
        if request.method == 'OPTIONS':
            return jsonify({})

        try:
            item = NewsEvent.query.get(item_id)
            if not item:
                return jsonify({"detail": "News/Event not found"}), 404

            saved_title = item.title
            saved_type = item.type

            # ── Clear cached images for this item (any size variants) ──
            try:
                for entry in (item.image_urls or []):
                    fid = None
                    if isinstance(entry, dict):
                        fid = entry.get('file_id')
                    elif isinstance(entry, str):
                        parsed = extract_drive_entry_from_url(entry)
                        fid = parsed.get('file_id') if parsed else None
                    if fid:
                        clear_cache(fid)
                print(f"🧹 Cleared image cache for news/event: {saved_title}")
            except Exception as cache_err:
                print(f"⚠️ Cache clear failed (continuing): {cache_err}")

            # Trash the per-item Drive folder (Images included)
            try:
                trash_news_item_folder(
                    item_type=saved_type,
                    title=saved_title,
                    item_id=item_id,
                )
            except Exception as drive_err:
                print(f"⚠️ Drive folder trash failed (continuing): {drive_err}")

            db.session.delete(item)
            db.session.commit()
            return jsonify({
                "message": "News/Event deleted successfully",
                "deleted_id": item_id,
                "deleted_title": saved_title,
            }), 200

        except Exception as e:
            db.session.rollback()
            print(f"Error deleting news/event: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500
    
    @app.route('/api/admin/news-events/bulk-delete', methods=['POST', 'OPTIONS'])
    def admin_bulk_delete_news_events():
        """Admin endpoint to delete multiple news/events"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            data = request.get_json()
            ids = data.get('ids', [])
            
            if not ids:
                return jsonify({"detail": "No IDs provided"}), 400
            
            deleted = []
            not_found = []
            
            for item_id in ids:
                item = NewsEvent.query.get(item_id)
                if item:
                    deleted.append({'id': item.id, 'title': item.title})
                    db.session.delete(item)
                else:
                    not_found.append(item_id)
            
            db.session.commit()
            
            return jsonify({
                "message": f"Deleted {len(deleted)} item(s)",
                "deleted": deleted,
                "not_found": not_found
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error bulk deleting: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500

    @app.route('/api/admin/news-events/<int:item_id>/toggle-publish', methods=['POST', 'OPTIONS'])
    def admin_toggle_publish(item_id):
        """Admin endpoint to toggle publish status"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            item = NewsEvent.query.get(item_id)
            if not item:
                return jsonify({"detail": "News/Event not found"}), 404
            
            item.is_published = not item.is_published
            db.session.commit()
            
            return jsonify({
                "message": f"Item {'published' if item.is_published else 'unpublished'} successfully",
                "is_published": item.is_published,
                "item": item.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error toggling publish: {e}")
            return jsonify({"detail": str(e)}), 500

    @app.route('/api/admin/news-events/stats', methods=['GET', 'OPTIONS'])
    def admin_news_events_stats():
        """Admin endpoint to get statistics"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            total = NewsEvent.query.count()
            published = NewsEvent.query.filter_by(is_published=True).count()
            drafts = NewsEvent.query.filter_by(is_published=False).count()
            featured = NewsEvent.query.filter_by(is_featured=True).count()
            
            news_count = NewsEvent.query.filter_by(type='NEWS').count()
            events_count = NewsEvent.query.filter_by(type='EVENT').count()
            announcements_count = NewsEvent.query.filter_by(type='ANNOUNCEMENT').count()
            
            # Total views
            total_views = db.session.query(db.func.sum(NewsEvent.views_count)).scalar() or 0
            
            return jsonify({
                'total': total,
                'published': published,
                'drafts': drafts,
                'featured': featured,
                'by_type': {
                    'news': news_count,
                    'events': events_count,
                    'announcements': announcements_count
                },
                'total_views': total_views
            }), 200
            
        except Exception as e:
            print(f"Error fetching stats: {e}")
            return jsonify({"detail": str(e)}), 500
