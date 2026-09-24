# about_routes.py
from flask import jsonify, request
from models import db, AboutContent, AboutStat, AboutCard, AboutFeature, User
from functools import wraps
import json
import traceback
from datetime import datetime


def admin_required(f):
    """Decorator to check if user is admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            # For demo, we trust the request. In production, verify JWT.
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"detail": str(e)}), 401
    return decorated_function


# ============================================================
# DEFAULT CONTENT (used when the DB has no About data yet)
# ============================================================
DEFAULT_ABOUT_CONTENT = {
    'header': {
        'title': 'About',
        'title_highlight': 'PEMnet',
        'subtitle': 'PEMNet (Philippine Extension and Research Management Network) is a collaborative platform that connects researchers, extension workers, institutions, and communities to promote impactful research, knowledge sharing, and sustainable development.'
    },
    'what_is': {
        'heading': 'What is PEMNet?',
        'description': 'PEMNet is a unified network that supports the entire research and extension ecosystem from project development, management, and dissemination to community engagement and impact assessment.'
    },
    'mission': {
        'heading': 'Our Mission',
        'description': 'To empower researchers and extension practitioners by providing a dynamic platform for collaboration, knowledge sharing, and community engagement for national development.'
    },
    'vision': {
        'heading': 'Our Vision',
        'description': 'A connected research and extension community driving innovation, sustainability, and inclusive growth throughout the Philippines.'
    },
    'core_values': {
        'heading': 'Core Values',
        'values': ['Collaboration', 'Integrity', 'Excellence', 'Sustainability', 'Inclusivity']
    },
    'what_we_do': {
        'heading': 'What We Do'
    }
}

DEFAULT_STATS = [
    {'value': '85+', 'label': 'Member Institutions', 'sublabel': 'Across the Philippines', 'icon_type': 'users', 'color_theme': 'blue', 'display_order': 1},
    {'value': '3,250+', 'label': 'Research Projects', 'sublabel': 'Completed & Ongoing', 'icon_type': 'book', 'color_theme': 'green', 'display_order': 2},
    {'value': '12,480+', 'label': 'Researchers &', 'sublabel': 'Extensionists', 'icon_type': 'people', 'color_theme': 'yellow', 'display_order': 3},
    {'value': '250+', 'label': 'Communities', 'sublabel': 'Engaged Nationwide', 'icon_type': 'globe', 'color_theme': 'purple', 'display_order': 4},
]

DEFAULT_FEATURES = [
    {'text': 'Facilitate collaboration among SUCs, researchers, and communities', 'display_order': 1},
    {'text': 'Promote transparency and efficiency in research management', 'display_order': 2},
    {'text': 'Support evidence-based decision making and policy development', 'display_order': 3},
    {'text': 'Advance sustainable development through knowledge and innovation', 'display_order': 4},
]

DEFAULT_CARDS = [
    {'title': 'Research Management', 'description': 'Streamline the submission, review, and monitoring of research proposals and projects.', 'icon_type': 'document', 'color_theme': 'blue', 'display_order': 1},
    {'title': 'Knowledge Sharing', 'description': 'Provide access to research outputs, publications, and best practices.', 'icon_type': 'book', 'color_theme': 'green', 'display_order': 2},
    {'title': 'Community Engagement', 'description': 'Connect researchers with communities to address real-world challenges.', 'icon_type': 'people', 'color_theme': 'yellow', 'display_order': 3},
    {'title': 'Capacity Building', 'description': 'Offer trainings, webinars, and resources to strengthen research and extension capabilities.', 'icon_type': 'academic', 'color_theme': 'purple', 'display_order': 4},
    {'title': 'Information Dissemination', 'description': 'Share news, events, and opportunities to keep members informed and updated.', 'icon_type': 'megaphone', 'color_theme': 'blue', 'display_order': 5},
]


def _ensure_default_content():
    """Seed defaults if the DB is empty (idempotent)"""
    # Seed the JSON content sections
    for key, value in DEFAULT_ABOUT_CONTENT.items():
        existing = AboutContent.query.filter_by(section_key=key).first()
        if not existing:
            db.session.add(AboutContent(
                section_key=key,
                content=json.dumps(value)
            ))
    
    # Seed stats
    if AboutStat.query.count() == 0:
        for stat in DEFAULT_STATS:
            db.session.add(AboutStat(**stat))
    
    # Seed features
    if AboutFeature.query.count() == 0:
        for feat in DEFAULT_FEATURES:
            db.session.add(AboutFeature(section='what_is', **feat))
    
    # Seed cards
    if AboutCard.query.count() == 0:
        for card in DEFAULT_CARDS:
            db.session.add(AboutCard(**card))
    
    db.session.commit()


def register_about_routes(app):
    """Register all About page routes"""
    
    # Initialize defaults on first request
    with app.app_context():
        try:
            _ensure_default_content()
            print("✅ About page content initialized")
        except Exception as e:
            print(f"⚠️  Could not seed About content: {e}")
    
    
    # ============================================================
    # PUBLIC ROUTES
    # ============================================================
    
    @app.route('/api/about', methods=['GET', 'OPTIONS'])
    def get_about_content():
        """Public endpoint to fetch all About page content"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            # Fetch all JSON content sections
            content_rows = AboutContent.query.all()
            content_map = {}
            for row in content_rows:
                content_map[row.section_key] = json.loads(row.content) if row.content else {}
            
            # Merge with defaults for any missing keys
            for key, default_val in DEFAULT_ABOUT_CONTENT.items():
                if key not in content_map:
                    content_map[key] = default_val
            
            # Fetch stats (ordered)
            stats = AboutStat.query.filter_by(is_active=True).order_by(AboutStat.display_order).all()
            
            # Fetch features (ordered)
            features = AboutFeature.query.filter_by(
                is_active=True, section='what_is'
            ).order_by(AboutFeature.display_order).all()
            
            # Fetch cards (ordered)
            cards = AboutCard.query.filter_by(is_active=True).order_by(AboutCard.display_order).all()
            
            return jsonify({
                'content': content_map,
                'stats': [s.to_dict() for s in stats],
                'features': [f.to_dict() for f in features],
                'cards': [c.to_dict() for c in cards]
            }), 200
            
        except Exception as e:
            print(f"Error fetching about content: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500
    
    
    # ============================================================
    # ADMIN ROUTES
    # ============================================================
    
    @app.route('/api/admin/about', methods=['GET', 'OPTIONS'])
    def admin_get_about_content():
        """Admin endpoint to fetch ALL About page content (including inactive)"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            content_rows = AboutContent.query.all()
            content_map = {}
            for row in content_rows:
                content_map[row.section_key] = json.loads(row.content) if row.content else {}
            
            for key, default_val in DEFAULT_ABOUT_CONTENT.items():
                if key not in content_map:
                    content_map[key] = default_val
            
            stats = AboutStat.query.order_by(AboutStat.display_order).all()
            features = AboutFeature.query.order_by(AboutFeature.display_order).all()
            cards = AboutCard.query.order_by(AboutCard.display_order).all()
            
            return jsonify({
                'content': content_map,
                'stats': [s.to_dict() for s in stats],
                'features': [f.to_dict() for f in features],
                'cards': [c.to_dict() for c in cards]
            }), 200
            
        except Exception as e:
            print(f"Error fetching admin about content: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500
    
    
    @app.route('/api/admin/about/content', methods=['PUT', 'OPTIONS'])
    def admin_update_about_content():
        """Update JSON-based content sections (header, what_is, mission, vision, core_values)"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            data = request.get_json()
            if not data:
                return jsonify({"detail": "Request body required"}), 400
            
            user_id = data.pop('_user_id', None)
            changes = {}
            
            for section_key, section_value in data.items():
                if section_key.startswith('_'):
                    continue  # Skip meta fields
                
                # Only handle known content sections
                if section_key not in DEFAULT_ABOUT_CONTENT:
                    continue
                
                existing = AboutContent.query.filter_by(section_key=section_key).first()
                new_content_json = json.dumps(section_value)
                
                if existing:
                    old_content = json.loads(existing.content) if existing.content else {}
                    if old_content != section_value:
                        changes[section_key] = {'old': old_content, 'new': section_value}
                        existing.content = new_content_json
                        existing.updated_by = user_id
                else:
                    changes[section_key] = {'old': None, 'new': section_value}
                    db.session.add(AboutContent(
                        section_key=section_key,
                        content=new_content_json,
                        updated_by=user_id
                    ))
            
            if changes:
                db.session.commit()
                print(f"✅ Updated About content sections: {list(changes.keys())}")
            
            return jsonify({
                "message": f"Updated {len(changes)} section(s)" if changes else "No changes made",
                "changes": changes
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating about content: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500
    
    
    # -------------------- STATS --------------------
    
    @app.route('/api/admin/about/stats', methods=['POST', 'OPTIONS'])
    def admin_create_stat():
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            data = request.get_json()
            
            # Validate
            if not data.get('value') or not data.get('label'):
                return jsonify({"detail": "Value and label are required"}), 400
            
            # Determine next display order
            max_order = db.session.query(db.func.max(AboutStat.display_order)).scalar() or 0
            
            stat = AboutStat(
                value=data['value'].strip(),
                label=data['label'].strip(),
                sublabel=data.get('sublabel', '').strip() or None,
                icon_type=data.get('icon_type', 'users'),
                color_theme=data.get('color_theme', 'blue'),
                display_order=data.get('display_order', max_order + 1),
                is_active=data.get('is_active', True),
                updated_by=data.get('_user_id')
            )
            
            db.session.add(stat)
            db.session.commit()
            
            return jsonify({
                "message": "Stat created successfully",
                "stat": stat.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating stat: {e}")
            traceback.print_exc()
            return jsonify({"detail": str(e)}), 500
    
    
    @app.route('/api/admin/about/stats/<int:stat_id>', methods=['PUT', 'OPTIONS'])
    def admin_update_stat(stat_id):
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            stat = AboutStat.query.get(stat_id)
            if not stat:
                return jsonify({"detail": "Stat not found"}), 404
            
            data = request.get_json()
            changes = {}
            
            for field in ['value', 'label', 'sublabel', 'icon_type', 'color_theme']:
                if field in data:
                    new_val = data[field].strip() if isinstance(data[field], str) else data[field]
                    old_val = getattr(stat, field)
                    if old_val != new_val:
                        changes[field] = {'old': old_val, 'new': new_val}
                        setattr(stat, field, new_val)
            
            if 'display_order' in data:
                stat.display_order = data['display_order']
            
            if 'is_active' in data:
                stat.is_active = bool(data['is_active'])
            
            if '_user_id' in data:
                stat.updated_by = data['_user_id']
            
            db.session.commit()
            
            return jsonify({
                "message": "Stat updated successfully",
                "changes": changes,
                "stat": stat.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating stat: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    @app.route('/api/admin/about/stats/<int:stat_id>', methods=['DELETE', 'OPTIONS'])
    def admin_delete_stat(stat_id):
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            stat = AboutStat.query.get(stat_id)
            if not stat:
                return jsonify({"detail": "Stat not found"}), 404
            
            value = stat.value
            db.session.delete(stat)
            db.session.commit()
            
            return jsonify({
                "message": f"Stat '{value}' deleted successfully"
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting stat: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    # -------------------- FEATURES --------------------
    
    @app.route('/api/admin/about/features', methods=['POST', 'OPTIONS'])
    def admin_create_feature():
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            data = request.get_json()
            
            if not data.get('text'):
                return jsonify({"detail": "Feature text is required"}), 400
            
            max_order = db.session.query(
                db.func.max(AboutFeature.display_order)
            ).filter_by(section='what_is').scalar() or 0
            
            feature = AboutFeature(
                text=data['text'].strip(),
                section=data.get('section', 'what_is'),
                display_order=data.get('display_order', max_order + 1),
                is_active=data.get('is_active', True),
                updated_by=data.get('_user_id')
            )
            
            db.session.add(feature)
            db.session.commit()
            
            return jsonify({
                "message": "Feature created successfully",
                "feature": feature.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating feature: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    @app.route('/api/admin/about/features/<int:feature_id>', methods=['PUT', 'OPTIONS'])
    def admin_update_feature(feature_id):
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            feature = AboutFeature.query.get(feature_id)
            if not feature:
                return jsonify({"detail": "Feature not found"}), 404
            
            data = request.get_json()
            
            if 'text' in data and data['text'].strip():
                feature.text = data['text'].strip()
            
            if 'display_order' in data:
                feature.display_order = data['display_order']
            
            if 'is_active' in data:
                feature.is_active = bool(data['is_active'])
            
            if '_user_id' in data:
                feature.updated_by = data['_user_id']
            
            db.session.commit()
            
            return jsonify({
                "message": "Feature updated successfully",
                "feature": feature.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating feature: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    @app.route('/api/admin/about/features/<int:feature_id>', methods=['DELETE', 'OPTIONS'])
    def admin_delete_feature(feature_id):
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            feature = AboutFeature.query.get(feature_id)
            if not feature:
                return jsonify({"detail": "Feature not found"}), 404
            
            db.session.delete(feature)
            db.session.commit()
            
            return jsonify({"message": "Feature deleted successfully"}), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting feature: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    # -------------------- CARDS --------------------
    
    @app.route('/api/admin/about/cards', methods=['POST', 'OPTIONS'])
    def admin_create_card():
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            data = request.get_json()
            
            if not data.get('title'):
                return jsonify({"detail": "Card title is required"}), 400
            
            max_order = db.session.query(db.func.max(AboutCard.display_order)).scalar() or 0
            
            card = AboutCard(
                title=data['title'].strip(),
                description=data.get('description', '').strip() or None,
                icon_type=data.get('icon_type', 'document'),
                color_theme=data.get('color_theme', 'blue'),
                display_order=data.get('display_order', max_order + 1),
                is_active=data.get('is_active', True),
                updated_by=data.get('_user_id')
            )
            
            db.session.add(card)
            db.session.commit()
            
            return jsonify({
                "message": "Card created successfully",
                "card": card.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating card: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    @app.route('/api/admin/about/cards/<int:card_id>', methods=['PUT', 'OPTIONS'])
    def admin_update_card(card_id):
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            card = AboutCard.query.get(card_id)
            if not card:
                return jsonify({"detail": "Card not found"}), 404
            
            data = request.get_json()
            
            for field in ['title', 'description', 'icon_type', 'color_theme']:
                if field in data:
                    new_val = data[field].strip() if isinstance(data[field], str) else data[field]
                    setattr(card, field, new_val)
            
            if 'display_order' in data:
                card.display_order = data['display_order']
            
            if 'is_active' in data:
                card.is_active = bool(data['is_active'])
            
            if '_user_id' in data:
                card.updated_by = data['_user_id']
            
            db.session.commit()
            
            return jsonify({
                "message": "Card updated successfully",
                "card": card.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating card: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    @app.route('/api/admin/about/cards/<int:card_id>', methods=['DELETE', 'OPTIONS'])
    def admin_delete_card(card_id):
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            card = AboutCard.query.get(card_id)
            if not card:
                return jsonify({"detail": "Card not found"}), 404
            
            db.session.delete(card)
            db.session.commit()
            
            return jsonify({"message": "Card deleted successfully"}), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting card: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    # -------------------- BULK REORDER --------------------
    
    @app.route('/api/admin/about/reorder', methods=['POST', 'OPTIONS'])
    def admin_reorder_items():
        """Reorder stats, features, or cards in bulk"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            data = request.get_json()
            item_type = data.get('type')  # 'stats', 'features', 'cards'
            ordered_ids = data.get('ordered_ids', [])
            
            if not item_type or not ordered_ids:
                return jsonify({"detail": "Item type and ordered IDs required"}), 400
            
            model_map = {
                'stats': AboutStat,
                'features': AboutFeature,
                'cards': AboutCard,
            }
            
            model = model_map.get(item_type)
            if not model:
                return jsonify({"detail": "Invalid item type"}), 400
            
            for index, item_id in enumerate(ordered_ids):
                item = model.query.get(item_id)
                if item:
                    item.display_order = index + 1
            
            db.session.commit()
            
            return jsonify({"message": f"Reordered {len(ordered_ids)} {item_type}"}), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error reordering: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    # -------------------- RESET TO DEFAULTS --------------------
    
    @app.route('/api/admin/about/reset', methods=['POST', 'OPTIONS'])
    def admin_reset_about():
        """Reset all About content to defaults (dangerous!)"""
        if request.method == 'OPTIONS':
            return jsonify({})
        
        try:
            # Delete everything
            AboutContent.query.delete()
            AboutStat.query.delete()
            AboutFeature.query.delete()
            AboutCard.query.delete()
            db.session.commit()
            
            # Re-seed
            _ensure_default_content()
            
            return jsonify({"message": "About page reset to defaults"}), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error resetting: {e}")
            return jsonify({"detail": str(e)}), 500
    
    
    print("✅ About page routes registered")