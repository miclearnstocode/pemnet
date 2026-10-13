from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from models import db, HelpTopic, HelpArticle, HelpWorkflowStep, HelpFaq
import re

help_bp = Blueprint('help', __name__)   # NO url_prefix here


def _slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


# ==================== DEBUG ====================

@help_bp.route('/api/help/_ping', methods=['GET'])
def help_ping():
    """Sanity check — if this returns, the blueprint is registered."""
    return jsonify({
        'ok': True,
        'topics_total': HelpTopic.query.count(),
        'topics_active': HelpTopic.query.filter_by(is_active=True).count(),
        'articles_total': HelpArticle.query.count(),
        'articles_published': HelpArticle.query.filter_by(is_published=True).count(),
        'workflow_total': HelpWorkflowStep.query.count(),
        'workflow_active': HelpWorkflowStep.query.filter_by(is_active=True).count(),
        'faqs_total': HelpFaq.query.count(),
    }), 200


# ==================== PUBLIC ROUTES ====================

@help_bp.route('/api/help/topics', methods=['GET'])
def get_public_topics():
    try:
        topics = HelpTopic.query.filter_by(is_active=True)\
            .order_by(HelpTopic.display_order, HelpTopic.title).all()
        return jsonify([t.to_dict() for t in topics]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/help/topics/<slug>', methods=['GET'])
def get_public_topic(slug):
    try:
        topic = HelpTopic.query.filter_by(slug=slug, is_active=True).first()
        if not topic:
            return jsonify({'error': 'Topic not found'}), 404
        topic.view_count = (topic.view_count or 0) + 1
        db.session.commit()
        return jsonify(topic.to_dict(include_articles=True)), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/help/articles', methods=['GET'])
def get_public_articles():
    try:
        topic_slug = request.args.get('topic')
        featured = request.args.get('featured')

        query = HelpArticle.query.filter_by(is_published=True)

        if topic_slug:
            topic = HelpTopic.query.filter_by(slug=topic_slug).first()
            if topic:
                query = query.filter_by(topic_id=topic.id)

        if featured == 'true':
            query = query.filter_by(is_featured=True)

        articles = query.order_by(HelpArticle.display_order, HelpArticle.title).all()
        return jsonify([a.to_dict() for a in articles]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/help/articles/<slug>', methods=['GET'])
def get_public_article(slug):
    try:
        article = HelpArticle.query.filter_by(slug=slug, is_published=True).first()
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        article.view_count = (article.view_count or 0) + 1
        db.session.commit()
        return jsonify(article.to_dict()), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/help/workflow', methods=['GET'])
def get_public_workflow():
    try:
        steps = HelpWorkflowStep.query.filter_by(is_active=True)\
            .order_by(HelpWorkflowStep.display_order, HelpWorkflowStep.step_number).all()
        return jsonify([s.to_dict() for s in steps]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/help/faqs', methods=['GET'])
def get_public_faqs():
    try:
        category = request.args.get('category')
        query = HelpFaq.query.filter_by(is_active=True)
        if category:
            query = query.filter_by(category=category)
        faqs = query.order_by(HelpFaq.display_order).all()
        return jsonify([f.to_dict() for f in faqs]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/help/search', methods=['GET'])
def search_help():
    try:
        q = request.args.get('q', '').strip()
        if not q:
            return jsonify({'topics': [], 'articles': []}), 200

        like = f'%{q}%'
        topics = HelpTopic.query.filter(
            HelpTopic.is_active == True,
            or_(
                HelpTopic.title.ilike(like),
                HelpTopic.description.ilike(like),
            )
        ).limit(10).all()

        articles = HelpArticle.query.filter(
            HelpArticle.is_published == True,
            or_(
                HelpArticle.title.ilike(like),
                HelpArticle.excerpt.ilike(like),
                HelpArticle.content.ilike(like),
            )
        ).limit(20).all()

        return jsonify({
            'topics': [t.to_dict() for t in topics],
            'articles': [a.to_dict() for a in articles],
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ==================== ADMIN ROUTES ====================

@help_bp.route('/api/admin/help/stats', methods=['GET'])
def admin_help_stats():
    try:
        total_topics = HelpTopic.query.count()
        active_topics = HelpTopic.query.filter_by(is_active=True).count()
        total_articles = HelpArticle.query.count()
        published_articles = HelpArticle.query.filter_by(is_published=True).count()
        total_views = db.session.query(db.func.sum(HelpArticle.view_count)).scalar() or 0

        return jsonify({
            'total_topics': total_topics,
            'active_topics': active_topics,
            'total_articles': total_articles,
            'published_articles': published_articles,
            'total_views': total_views,
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/topics', methods=['GET'])
def admin_get_topics():
    try:
        topics = HelpTopic.query.order_by(HelpTopic.display_order, HelpTopic.title).all()
        return jsonify([t.to_dict(include_articles=True) for t in topics]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/topics', methods=['POST'])
def admin_create_topic():
    try:
        data = request.get_json() or {}
        title = data.get('title', '').strip()
        if not title:
            return jsonify({'error': 'Title is required'}), 400

        slug = data.get('slug') or _slugify(title)
        base_slug = slug
        counter = 1
        while HelpTopic.query.filter_by(slug=slug).first():
            slug = f'{base_slug}-{counter}'
            counter += 1

        topic = HelpTopic(
            title=title,
            slug=slug,
            description=data.get('description'),
            icon_type=data.get('icon_type', 'document'),
            color_theme=data.get('color_theme', 'blue'),
            content=data.get('content'),
            display_order=data.get('display_order', 0),
            is_active=data.get('is_active', True),
            is_featured=data.get('is_featured', False),
            meta_title=data.get('meta_title'),
            meta_description=data.get('meta_description'),
        )
        db.session.add(topic)
        db.session.commit()
        return jsonify(topic.to_dict()), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/topics/<int:topic_id>', methods=['PUT'])
def admin_update_topic(topic_id):
    try:
        topic = HelpTopic.query.get(topic_id)
        if not topic:
            return jsonify({'error': 'Topic not found'}), 404

        data = request.get_json() or {}
        if 'title' in data: topic.title = data['title'].strip()
        if 'slug' in data and data['slug'] != topic.slug:
            new_slug = _slugify(data['slug'])
            if HelpTopic.query.filter(HelpTopic.slug == new_slug, HelpTopic.id != topic_id).first():
                return jsonify({'error': 'Slug already in use'}), 400
            topic.slug = new_slug
        if 'description' in data: topic.description = data['description']
        if 'icon_type' in data: topic.icon_type = data['icon_type']
        if 'color_theme' in data: topic.color_theme = data['color_theme']
        if 'content' in data: topic.content = data['content']
        if 'display_order' in data: topic.display_order = data['display_order']
        if 'is_active' in data: topic.is_active = data['is_active']
        if 'is_featured' in data: topic.is_featured = data['is_featured']
        if 'meta_title' in data: topic.meta_title = data['meta_title']
        if 'meta_description' in data: topic.meta_description = data['meta_description']

        db.session.commit()
        return jsonify(topic.to_dict()), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/topics/<int:topic_id>', methods=['DELETE'])
def admin_delete_topic(topic_id):
    try:
        topic = HelpTopic.query.get(topic_id)
        if not topic:
            return jsonify({'error': 'Topic not found'}), 404
        db.session.delete(topic)
        db.session.commit()
        return jsonify({'message': 'Topic deleted successfully'}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/topics/<int:topic_id>/articles', methods=['GET'])
def admin_get_topic_articles(topic_id):
    try:
        topic = HelpTopic.query.get(topic_id)
        if not topic:
            return jsonify({'error': 'Topic not found'}), 404
        return jsonify([a.to_dict() for a in topic.articles]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/articles', methods=['POST'])
def admin_create_article():
    try:
        data = request.get_json() or {}
        topic_id = data.get('topic_id')
        title = data.get('title', '').strip()

        if not topic_id:
            return jsonify({'error': 'topic_id is required'}), 400
        if not title:
            return jsonify({'error': 'Title is required'}), 400

        topic = HelpTopic.query.get(topic_id)
        if not topic:
            return jsonify({'error': 'Topic not found'}), 404

        slug = data.get('slug') or _slugify(title)
        base_slug = slug
        counter = 1
        while HelpArticle.query.filter_by(slug=slug).first():
            slug = f'{base_slug}-{counter}'
            counter += 1

        article = HelpArticle(
            topic_id=topic_id,
            title=title,
            slug=slug,
            excerpt=data.get('excerpt'),
            content=data.get('content'),
            reading_time=data.get('reading_time', 5),
            display_order=data.get('display_order', 0),
            is_published=data.get('is_published', True),
            is_featured=data.get('is_featured', False),
            meta_title=data.get('meta_title'),
            meta_description=data.get('meta_description'),
        )
        db.session.add(article)
        db.session.commit()
        return jsonify(article.to_dict()), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/articles/<int:article_id>', methods=['PUT'])
def admin_update_article(article_id):
    try:
        article = HelpArticle.query.get(article_id)
        if not article:
            return jsonify({'error': 'Article not found'}), 404

        data = request.get_json() or {}
        if 'title' in data: article.title = data['title'].strip()
        if 'slug' in data and data['slug'] != article.slug:
            new_slug = _slugify(data['slug'])
            if HelpArticle.query.filter(HelpArticle.slug == new_slug, HelpArticle.id != article_id).first():
                return jsonify({'error': 'Slug already in use'}), 400
            article.slug = new_slug
        if 'excerpt' in data: article.excerpt = data['excerpt']
        if 'content' in data: article.content = data['content']
        if 'reading_time' in data: article.reading_time = data['reading_time']
        if 'display_order' in data: article.display_order = data['display_order']
        if 'is_published' in data: article.is_published = data['is_published']
        if 'is_featured' in data: article.is_featured = data['is_featured']
        if 'topic_id' in data: article.topic_id = data['topic_id']
        if 'meta_title' in data: article.meta_title = data['meta_title']
        if 'meta_description' in data: article.meta_description = data['meta_description']

        db.session.commit()
        return jsonify(article.to_dict()), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/articles/<int:article_id>', methods=['DELETE'])
def admin_delete_article(article_id):
    try:
        article = HelpArticle.query.get(article_id)
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        db.session.delete(article)
        db.session.commit()
        return jsonify({'message': 'Article deleted successfully'}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/workflow', methods=['GET'])
def admin_get_workflow():
    try:
        steps = HelpWorkflowStep.query.order_by(HelpWorkflowStep.display_order).all()
        return jsonify([s.to_dict() for s in steps]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/workflow', methods=['POST'])
def admin_create_workflow():
    try:
        data = request.get_json() or {}
        step = HelpWorkflowStep(
            step_number=data.get('step_number', 1),
            title=data.get('title', '').strip(),
            description=data.get('description'),
            icon_type=data.get('icon_type', 'document'),
            color_theme=data.get('color_theme', 'blue'),
            display_order=data.get('display_order', 0),
            is_active=data.get('is_active', True),
        )
        if not step.title:
            return jsonify({'error': 'Title is required'}), 400
        db.session.add(step)
        db.session.commit()
        return jsonify(step.to_dict()), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/workflow/<int:step_id>', methods=['PUT'])
def admin_update_workflow(step_id):
    try:
        step = HelpWorkflowStep.query.get(step_id)
        if not step:
            return jsonify({'error': 'Step not found'}), 404
        data = request.get_json() or {}
        for field in ['step_number', 'title', 'description', 'icon_type', 'color_theme', 'display_order', 'is_active']:
            if field in data:
                setattr(step, field, data[field])
        db.session.commit()
        return jsonify(step.to_dict()), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/workflow/<int:step_id>', methods=['DELETE'])
def admin_delete_workflow(step_id):
    try:
        step = HelpWorkflowStep.query.get(step_id)
        if not step:
            return jsonify({'error': 'Step not found'}), 404
        db.session.delete(step)
        db.session.commit()
        return jsonify({'message': 'Step deleted'}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/faqs', methods=['GET'])
def admin_get_faqs():
    try:
        faqs = HelpFaq.query.order_by(HelpFaq.display_order).all()
        return jsonify([f.to_dict() for f in faqs]), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/faqs', methods=['POST'])
def admin_create_faq():
    try:
        data = request.get_json() or {}
        faq = HelpFaq(
            question=data.get('question', '').strip(),
            answer=data.get('answer'),
            category=data.get('category'),
            display_order=data.get('display_order', 0),
            is_active=data.get('is_active', True),
            is_featured=data.get('is_featured', False),
        )
        if not faq.question:
            return jsonify({'error': 'Question is required'}), 400
        db.session.add(faq)
        db.session.commit()
        return jsonify(faq.to_dict()), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/faqs/<int:faq_id>', methods=['PUT'])
def admin_update_faq(faq_id):
    try:
        faq = HelpFaq.query.get(faq_id)
        if not faq:
            return jsonify({'error': 'FAQ not found'}), 404
        data = request.get_json() or {}
        for field in ['question', 'answer', 'category', 'display_order', 'is_active', 'is_featured']:
            if field in data:
                setattr(faq, field, data[field])
        db.session.commit()
        return jsonify(faq.to_dict()), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@help_bp.route('/api/admin/help/faqs/<int:faq_id>', methods=['DELETE'])
def admin_delete_faq(faq_id):
    try:
        faq = HelpFaq.query.get(faq_id)
        if not faq:
            return jsonify({'error': 'FAQ not found'}), 404
        db.session.delete(faq)
        db.session.commit()
        return jsonify({'message': 'FAQ deleted'}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


def register_help_routes(app):
    app.register_blueprint(help_bp)
    print("✅ Help routes registered")