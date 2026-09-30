"""Fuzzy-matching filters that decide whether an email is an abstract submission."""

import re

try:
    from fuzzywuzzy import fuzz
    FUZZY_AVAILABLE = True
except ImportError:
    FUZZY_AVAILABLE = False
    print("⚠️  fuzzywuzzy not installed — falling back to exact matching")


_PEMNET_VARIANTS = [
    'pemnet 1st national extension conference',
    'pemnet 1st national extension conference 2026',
    '1st pemnet national extension conference',
    '1st pemnet national extension conference 2026',
    'first pemnet national extension conference',
    'pemnet national extension conference',
    'pemnet national extension conference 2026',
    'pemnet conference 2026',
    'pemnet 2026',
]


def _normalize_text(text: str) -> str:
    if not text:
        return ''
    t = text.lower()
    t = t.replace('\u2013', '-').replace('\u2014', '-').replace('\u2019', "'")
    t = re.sub(r'\b1st\b', 'first', t)
    t = re.sub(r'\b2nd\b', 'second', t)
    t = re.sub(r'\b3rd\b', 'third', t)
    t = re.sub(r'[^\w\s@.\-]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def _fuzzy_contains(needle: str, haystack: str, threshold: int = 88) -> bool:
    if not needle or not haystack:
        return False
    needle_n = _normalize_text(needle)
    haystack_n = _normalize_text(haystack)
    if not needle_n or not haystack_n:
        return False
    if needle_n in haystack_n:
        return True
    if not FUZZY_AVAILABLE:
        return False

    window_size = max(len(needle_n) * 2, 80)
    max_start = max(0, len(haystack_n) - window_size)
    step = max(1, len(needle_n) // 4)

    best = 0
    for start in range(0, max_start + 1, step):
        chunk = haystack_n[start:start + window_size]
        score = fuzz.partial_ratio(needle_n, chunk)
        best = max(best, score)
        if best >= threshold:
            return True

    if fuzz.partial_ratio(needle_n, haystack_n) >= threshold:
        return True
    return best >= threshold


def _matches_any_fuzzy(text: str, phrases: list, threshold: int = 88):
    if not text or not phrases:
        return None, 0
    text_n = _normalize_text(text)
    if not text_n:
        return None, 0

    for phrase in phrases:
        p_n = _normalize_text(phrase)
        if p_n and p_n in text_n:
            return phrase, 100

    if not FUZZY_AVAILABLE:
        return None, 0

    best_phrase, best_score = None, 0
    window_size = max(200, len(text_n))
    sample = text_n[:window_size]

    for phrase in phrases:
        score = fuzz.partial_ratio(_normalize_text(phrase), sample)
        if score > best_score:
            best_score = score
            best_phrase = phrase
        if best_score >= threshold:
            return best_phrase, best_score

    return (best_phrase, best_score) if best_score >= threshold else (None, 0)


def _is_any_variant(text: str, variants: list, threshold: int = 90) -> bool:
    return _matches_any_fuzzy(text, variants, threshold=threshold)[0] is not None


def is_abstract_submission(subject: str, body: str, sender_email: str) -> bool:
    """Return True if the email looks like a legitimate abstract submission."""
    subject = subject or ''
    body = body or ''
    sender_email = sender_email or ''

    subject_lower = subject.lower()
    sender_lower = sender_email.lower()

    # 1. Skip delivery failures
    if _fuzzy_contains('delivery status notification', subject_lower, 92):
        return False
    if 'mailer-daemon' in sender_lower or 'mail delivery subsystem' in sender_lower:
        return False
    if _fuzzy_contains('undelivered', subject_lower, 92):
        return False
    if _fuzzy_contains('delivery failure', subject_lower, 92):
        return False

    # 2. Skip meeting / planning requests
    meeting_keywords = [
        'request to allow', 'planning meeting', 'courtesy visit',
        'board member', 'meeting request', 'pemnet officer',
    ]
    if _matches_any_fuzzy(subject, meeting_keywords, threshold=90)[0]:
        return False

    # 3. Skip "interested participant"
    if _fuzzy_contains('interested participant', subject, 90):
        return False

    # 4. Skip invitations / reminders
    invitation_phrases = [
        'invitation to', 'you are invited', 'you have been invited',
        "you're invited", 'cordially invite', 'pleasure to invite',
        'please join us', 'welcome to the', 'register now for',
        'registration is now open', 'conference registration',
        'registration link', 'confirm your attendance', 'rsvp for',
        'reserve your seat', 'early bird registration', 'reminder',
        'registration reminder', 'conference reminder', 'abstract reminder',
    ]
    matched_invite, _ = _matches_any_fuzzy(subject, invitation_phrases, threshold=90)
    if matched_invite:
        return False

    if _is_any_variant(subject, _PEMNET_VARIANTS, threshold=90):
        submission_signals = ['submission', 'abstract', 'submit', 'paper',
                              'presentation', 'for consideration']
        if not _matches_any_fuzzy(subject, submission_signals, threshold=88)[0]:
            return False

    # 5. Positive signal required
    abstract_keywords = [
        'abstract submission', 'submission of abstract', 'submitting abstract',
        'abstract for submission', 'submit abstract', 'abstract entitled',
        'my abstract', 'our abstract', 'extension project abstract',
        'research abstract', 'attached is our abstract', 'attached is my abstract',
        'please find attached the abstract', 'here is our abstract',
        'enclosed is our abstract', 'submitted for presentation',
        'for presentation at the', 'i am pleased to submit',
        'we are pleased to submit', 'abstract for review', 'consideration',
        'presentation during the conference', 'present this research',
        'conference committee', 'extension project', 'research project',
        'project abstract', 'abstract_', 'pemnet abstract',
        'abstract -', 'abstract:', 'submission:', 'submission -',
        'submission of', 'i submit', 'we submit', 'respectfully submit',
        'i am submitting', 'we are submitting', 'ongoing extension program',
        'ongoing extension project', 'completed extension program',
        'completed extension project', 'extension program', 'extension paper',
        'paper to be presented', 'paper for presentation', 'for presentation',
        'presented at the', 'under the thematic area', 'thematic area:',
        'for consideration as a paper', 'for consideration as an abstract',
        'for the conference', 'to the conference', 'program leader',
        'project leader', 'proponent',
        'submission of two extension project',
        'submitting two extension project',
    ]

    if _matches_any_fuzzy(subject, abstract_keywords, threshold=85)[0]:
        return True
    if _matches_any_fuzzy(body, abstract_keywords, threshold=85)[0]:
        return True

    return False


def is_invitation_email(subject: str, body: str) -> bool:
    """Return True if the email is an invitation/reminder rather than a submission."""
    subject = subject or ''
    body = body or ''

    invitation_phrases = [
        'invitation to', 'you are invited', 'you have been invited',
        "you're invited", 'cordially invite', 'pleasure to invite',
        'please join us', 'welcome to the', 'register now for',
        'registration is now open', 'conference registration',
        'registration link', 'confirm your attendance', 'rsvp for',
        'reserve your seat', 'early bird registration',
        'invitation to the pemnet', 'reminder', 'registration reminder',
        'conference reminder', 'abstract reminder',
    ]
    if _matches_any_fuzzy(subject, invitation_phrases, threshold=90)[0]:
        return True

    if _is_any_variant(subject, _PEMNET_VARIANTS, threshold=90):
        submission_signals = ['submission', 'abstract', 'submit', 'paper']
        if not _matches_any_fuzzy(subject, submission_signals, threshold=88)[0]:
            return True

    abstract_submission_keywords = [
        'abstract submission', 'submit abstract', 'abstract entitled',
        'my abstract', 'our abstract', 'extension project abstract',
        'research abstract', 'attached is our abstract', 'please find attached',
        'here is our abstract', 'enclosed is our abstract',
        'submitted for presentation', 'for presentation at the',
        'submission of abstract', 'submitting abstract',
        'submission of two extension project', 'respectfully submit',
        'i submit', 'we submit', 'paper to be presented',
    ]
    if _matches_any_fuzzy(body, abstract_submission_keywords, threshold=85)[0]:
        return False

    return False


def should_skip_email(subject: str, body: str, sender_email: str):
    """Return (should_skip: bool, reason: str|None)."""
    subject = subject or ''
    body = body or ''
    sender_email = sender_email or ''

    subject_lower = subject.lower()
    sender_lower = sender_email.lower()

    # 1. Delivery failures
    if _fuzzy_contains('delivery status notification', subject_lower, 92):
        return True, "Delivery Status Notification"
    if 'mailer-daemon' in sender_lower or 'mail delivery subsystem' in sender_lower:
        return True, "Mail Delivery Subsystem"
    if _fuzzy_contains('delivery failure', subject_lower, 92):
        return True, "Delivery Failure"
    if _fuzzy_contains('undelivered', subject_lower, 92):
        return True, "Undelivered Mail"

    # 2. Meeting / planning requests
    meeting_keywords = [
        'request to allow', 'planning meeting', 'courtesy visit',
        'board member', 'meeting request', 'pemnet officer',
    ]
    matched, score = _matches_any_fuzzy(subject, meeting_keywords, threshold=90)
    if matched:
        return True, f"Meeting/Planning Request ('{matched}', score={score})"

    # 3. Non-abstract inquiries
    if _fuzzy_contains('interested participant', subject_lower, 90):
        return True, "Interested Participant (Not Abstract)"

    # 4. Auto-replies
    if _fuzzy_contains('auto-reply', subject_lower, 92) or \
       _fuzzy_contains('out of office', subject_lower, 92):
        return True, "Auto-Reply"

    # 5. Invitations / reminders
    invitation_keywords = [
        'invitation', 'invite', 'reminder', 'registration reminder',
        'conference reminder', 'abstract reminder', 'you are invited',
        'you have been invited', 'register now', 'early bird', 'rsvp',
    ]
    matched, score = _matches_any_fuzzy(subject, invitation_keywords, threshold=90)
    if matched:
        submission_override = ['submission', 'abstract', 'submit', 'paper']
        if not _matches_any_fuzzy(subject, submission_override, threshold=88)[0]:
            return True, f"Invitation/Reminder Email ('{matched}', score={score})"

    # 6. Must pass abstract check
    if not is_abstract_submission(subject, body, sender_email):
        return True, "Not an Abstract Submission"

    return False, None


def extract_project_leader(body: str):
    """Try to pull a project-leader name out of the email body."""
    if not body:
        return None

    patterns = [
        r'(?:Project Leader|Principal Investigator|Author|Proponent|Presenter)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'(?:Sincerely|Respectfully|Best regards)[\s,]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'(?:Submitted by|Presented by)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'\n([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*\n(?:Project Leader|Project Proponent|Author)',
    ]

    for pattern in patterns:
        match = re.search(pattern, body, re.IGNORECASE | re.MULTILINE)
        if match:
            return match.group(1).strip()

    return None