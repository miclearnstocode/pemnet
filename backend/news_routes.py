from flask import jsonify, request
from models import db, NewsEvent, User
from werkzeug.utils import secure_filename
from google_drive import upload_file_to_drive
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
            
            # For now, we'll trust the user_id passed in the request
            # In production, verify the token properly
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"detail": str(e)}), 401
    return decorated_function


def register_news_routes(app):
    """Register all news/event routes with the Flask app"""
    
    # ==================== PUBLIC ROUTES ====================
    
    @app.route('/api/news-events', methods=['GET', 'OPTIONS'])
    def get_public_news_events():
        """Public endpoint to fetch published news and events"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            # Query parameters
            item_type = request.args.get('type', 'all')
            search = request.args.get('search', '')
            limit = request.args.get('limit', type=int)
            featured_only = request.args.get('featured', 'false').lower() == 'true'
            
            query = NewsEvent.query.filter_by(is_published=True)
            
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
                query = query.filter_by(is_featured=True)
            
            # Order by event date (newest first), fallback to created_at
            query = query.order_by(
                db.desc(db.func.coalesce(NewsEvent.event_start_date, NewsEvent.created_at))
            )
            
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
                        NewsEvent.tag.ilike(search_pattern)
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
        """Admin endpoint to create a new news/event"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        temp_files = []
        temp_dir = None
        
        try:
            # Check if it's multipart form data (with image) or JSON
            if request.content_type and 'multipart/form-data' in request.content_type:
                data = request.form.to_dict()
                image_file = request.files.get('image')
            else:
                data = request.get_json() or {}
                image_file = None
            
            # Validate required fields
            title = data.get('title', '').strip()
            item_type = data.get('type', 'NEWS').upper()
            date_display = data.get('date_display', '').strip()
            
            if not title:
                return jsonify({"detail": "Title is required"}), 400
            
            if item_type not in ['NEWS', 'EVENT', 'ANNOUNCEMENT']:
                return jsonify({"detail": "Invalid type. Must be NEWS, EVENT, or ANNOUNCEMENT"}), 400
            
            if not date_display:
                return jsonify({"detail": "Display date is required"}), 400
            
            # Get color defaults based on type
            default_colors = {
                'NEWS': {'type_color': 'bg-yellow-100 text-yellow-800', 'tag_color': 'bg-yellow-50 text-yellow-700 border-yellow-200'},
                'EVENT': {'type_color': 'bg-blue-100 text-blue-800', 'tag_color': 'bg-blue-50 text-blue-700 border-blue-200'},
                'ANNOUNCEMENT': {'type_color': 'bg-green-100 text-green-800', 'tag_color': 'bg-green-50 text-green-700 border-green-200'}
            }
            
            # Handle image upload to Google Drive
            image_url = data.get('image_url', '').strip() or None
            
            if image_file and image_file.filename:
                # Validate file type
                allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
                file_ext = os.path.splitext(image_file.filename)[1].lower()
                
                if file_ext not in allowed_extensions:
                    return jsonify({"detail": "Invalid image format. Allowed: JPG, PNG, GIF, WEBP, BMP"}), 400
                
                # Sanitize filename
                safe_filename = secure_filename(image_file.filename.replace(' ', '_'))
                
                # Create temp directory
                temp_dir = tempfile.mkdtemp()
                file_path = os.path.join(temp_dir, safe_filename)
                image_file.save(file_path)
                temp_files.append(file_path)
                
                # Upload to Google Drive (in a News/Events folder)
                try:
                    view_url, _ = upload_file_to_drive(
                        file_path,
                        f"news_event_{safe_filename}",
                        project_title=f"NewsEvents/{item_type}",
                        sender_name="Admin"
                    )
                    image_url = view_url
                    print(f"✅ Image uploaded to Drive: {image_url}")
                except Exception as drive_error:
                    print(f"⚠️ Drive upload failed: {drive_error}")
                    # Continue without image if upload fails
                    image_url = data.get('image_url', '').strip() or None
            
            # Parse event dates if provided
            event_start_date = None
            event_end_date = None
            
            if data.get('event_start_date'):
                try:
                    event_start_date = datetime.fromisoformat(data['event_start_date'].replace('Z', '+00:00'))
                except:
                    try:
                        event_start_date = datetime.strptime(data['event_start_date'], '%Y-%m-%d')
                    except:
                        pass
            
            if data.get('event_end_date'):
                try:
                    event_end_date = datetime.fromisoformat(data['event_end_date'].replace('Z', '+00:00'))
                except:
                    try:
                        event_end_date = datetime.strptime(data['event_end_date'], '%Y-%m-%d')
                    except:
                        pass
            
            # Create the news/event
            new_item = NewsEvent(
                type=item_type,
                title=title,
                excerpt=data.get('excerpt', '').strip() or None,
                content=data.get('content', '').strip() or None,
                date_display=date_display,
                event_start_date=event_start_date,
                event_end_date=event_end_date,
                tag=data.get('tag', '').strip() or None,
                tag_color=data.get('tag_color', '').strip() or default_colors[item_type]['tag_color'],
                type_color=data.get('type_color', '').strip() or default_colors[item_type]['type_color'],
                image_url=image_url,
                is_published=data.get('is_published', 'true').lower() == 'true' if isinstance(data.get('is_published'), str) else bool(data.get('is_published', True)),
                is_featured=data.get('is_featured', 'false').lower() == 'true' if isinstance(data.get('is_featured'), str) else bool(data.get('is_featured', False)),
                created_by=data.get('created_by')
            )
            
            db.session.add(new_item)
            db.session.commit()
            
            print(f"✅ Created news/event: {title} (ID: {new_item.id})")
            
            return jsonify({
                "message": "News/Event created successfully",
                "item": new_item.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating news/event: {e}")
            traceback.print_exc()
            
            # Cleanup temp files
            for f in temp_files:
                try:
                    if os.path.exists(f):
                        os.remove(f)
                except:
                    pass
            if temp_dir and os.path.exists(temp_dir):
                try:
                    os.rmdir(temp_dir)
                except:
                    pass
            
            return jsonify({"detail": str(e)}), 500
        finally:
            # Cleanup temp files
            for f in temp_files:
                try:
                    if os.path.exists(f):
                        os.remove(f)
                except:
                    pass
            if temp_dir and os.path.exists(temp_dir):
                try:
                    os.rmdir(temp_dir)
                except:
                    pass

    @app.route('/api/admin/news-events/<int:item_id>', methods=['PUT', 'OPTIONS'])
    def admin_update_news_event(item_id):
        """Admin endpoint to update a news/event"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        temp_files = []
        temp_dir = None
        
        try:
            item = NewsEvent.query.get(item_id)
            if not item:
                return jsonify({"detail": "News/Event not found"}), 404
            
            # Check if it's multipart form data (with image) or JSON
            if request.content_type and 'multipart/form-data' in request.content_type:
                data = request.form.to_dict()
                image_file = request.files.get('image')
            else:
                data = request.get_json() or {}
                image_file = None
            
            changes = {}
            
            # Update fields if provided
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
                    # Update colors if type changed and no custom colors provided
                    if 'type_color' not in data:
                        default_type_colors = {
                            'NEWS': 'bg-yellow-100 text-yellow-800',
                            'EVENT': 'bg-blue-100 text-blue-800',
                            'ANNOUNCEMENT': 'bg-green-100 text-green-800'
                        }
                        item.type_color = default_type_colors.get(new_type, item.type_color)
            
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
                except:
                    try:
                        new_start = datetime.strptime(data['event_start_date'], '%Y-%m-%d') if data['event_start_date'] else None
                    except:
                        new_start = None
                
                if new_start != item.event_start_date:
                    changes['event_start_date'] = {
                        'old': item.event_start_date.strftime('%Y-%m-%d') if item.event_start_date else None,
                        'new': new_start.strftime('%Y-%m-%d') if new_start else None
                    }
                    item.event_start_date = new_start
            
            if 'event_end_date' in data:
                try:
                    new_end = datetime.fromisoformat(data['event_end_date'].replace('Z', '+00:00')) if data['event_end_date'] else None
                except:
                    try:
                        new_end = datetime.strptime(data['event_end_date'], '%Y-%m-%d') if data['event_end_date'] else None
                    except:
                        new_end = None
                
                if new_end != item.event_end_date:
                    changes['event_end_date'] = {
                        'old': item.event_end_date.strftime('%Y-%m-%d') if item.event_end_date else None,
                        'new': new_end.strftime('%Y-%m-%d') if new_end else None
                    }
                    item.event_end_date = new_end
            
            if 'tag' in data:
                new_tag = data['tag'].strip() if data['tag'] else None
                if new_tag != item.tag:
                    changes['tag'] = {'old': item.tag, 'new': new_tag}
                    item.tag = new_tag
            
            if 'tag_color' in data:
                new_tag_color = data['tag_color'].strip() if data['tag_color'] else None
                if new_tag_color != item.tag_color:
                    changes['tag_color'] = {'old': item.tag_color, 'new': new_tag_color}
                    item.tag_color = new_tag_color
            
            if 'type_color' in data:
                new_type_color = data['type_color'].strip() if data['type_color'] else None
                if new_type_color != item.type_color:
                    changes['type_color'] = {'old': item.type_color, 'new': new_type_color}
                    item.type_color = new_type_color
            
            if 'is_published' in data:
                new_published = data['is_published'].lower() == 'true' if isinstance(data['is_published'], str) else bool(data['is_published'])
                if new_published != item.is_published:
                    changes['is_published'] = {'old': item.is_published, 'new': new_published}
                    item.is_published = new_published
            
            if 'is_featured' in data:
                new_featured = data['is_featured'].lower() == 'true' if isinstance(data['is_featured'], str) else bool(data['is_featured'])
                if new_featured != item.is_featured:
                    changes['is_featured'] = {'old': item.is_featured, 'new': new_featured}
                    item.is_featured = new_featured
            
            # Handle new image upload
            if image_file and image_file.filename:
                allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
                file_ext = os.path.splitext(image_file.filename)[1].lower()
                
                if file_ext not in allowed_extensions:
                    return jsonify({"detail": "Invalid image format. Allowed: JPG, PNG, GIF, WEBP, BMP"}), 400
                
                safe_filename = secure_filename(image_file.filename.replace(' ', '_'))
                temp_dir = tempfile.mkdtemp()
                file_path = os.path.join(temp_dir, safe_filename)
                image_file.save(file_path)
                temp_files.append(file_path)
                
                try:
                    view_url, _ = upload_file_to_drive(
                        file_path,
                        f"news_event_{safe_filename}",
                        project_title=f"NewsEvents/{item.type}",
                        sender_name="Admin"
                    )
                    changes['image_url'] = {'old': item.image_url, 'new': view_url}
                    item.image_url = view_url
                    print(f"✅ New image uploaded: {view_url}")
                except Exception as drive_error:
                    print(f"⚠️ Drive upload failed: {drive_error}")
            
            elif 'image_url' in data:
                new_image_url = data['image_url'].strip() if data['image_url'] else None
                if new_image_url != item.image_url:
                    changes['image_url'] = {'old': item.image_url, 'new': new_image_url}
                    item.image_url = new_image_url
            
            if changes:
                db.session.commit()
                print(f"✅ Updated news/event {item_id}: {list(changes.keys())}")
                
                return jsonify({
                    "message": "News/Event updated successfully",
                    "changes": changes,
                    "item": item.to_dict()
                }), 200
            else:
                return jsonify({
                    "message": "No changes made",
                    "item": item.to_dict()
                }), 200
            
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
                except:
                    pass
            if temp_dir and os.path.exists(temp_dir):
                try:
                    os.rmdir(temp_dir)
                except:
                    pass

    @app.route('/api/admin/news-events/<int:item_id>', methods=['DELETE', 'OPTIONS'])
    def admin_delete_news_event(item_id):
        """Admin endpoint to delete a news/event"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            item = NewsEvent.query.get(item_id)
            if not item:
                return jsonify({"detail": "News/Event not found"}), 404
            
            title = item.title  # Save for response
            
            db.session.delete(item)
            db.session.commit()
            
            print(f"✅ Deleted news/event: {title} (ID: {item_id})")
            
            return jsonify({
                "message": "News/Event deleted successfully",
                "deleted_id": item_id,
                "deleted_title": title
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

    print("✅ News/Events routes registered")