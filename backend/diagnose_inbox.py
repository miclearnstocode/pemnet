"""
Trace the sync's exact pipeline on a per-email basis.
No chunking. No filters applied in bulk. Just:
  1. Fetch with the same query the sync uses
  2. Run the same classifier the sync uses
  3. Print each email's decision

Then we grep for Solomo and see exactly what happened.
"""
from gmail_service import GmailService
from app import should_skip_email, is_invitation_email, is_abstract_submission
from models import EmailSubmission
from app import app, db

app.app_context().push()

gs = GmailService(target_email='pemnet26@gmail.com')

# ---- SAME QUERY AS THE SYNC ----
QUERY = 'has:attachment -from:pemnet26@gmail.com -in:spam'

print("=" * 70)
print("STEP 1: Fetch (no chunking, exactly like diagnose_inbox Test 2)")
print("=" * 70)
emails = gs.get_emails_with_attachments(
    query=QUERY,
    max_results=20000,
    chunk_by_month=False,   # ← explicitly OFF — matches Test 2
)
print(f"\n>>> Fetched {len(emails)} emails\n")

print("=" * 70)
print("STEP 2: Check DB for existing records")
print("=" * 70)
existing_ids = set()
for (mid,) in db.session.query(EmailSubmission.email_message_id).all():
    if mid:
        existing_ids.add(mid.split('__att')[0])
print(f">>> DB has {len(existing_ids)} existing email records\n")

print("=" * 70)
print("STEP 3: Per-email decision (same logic as sync)")
print("=" * 70)

solomo_decision = None
decisions = {
    'skip_already_in_db': 0,
    'skip_notification': 0,
    'skip_invitation': 0,
    'skip_not_abstract': 0,
    'skip_self': 0,
    'would_process': 0,
}

for e in emails:
    gmail_id = e['id']
    subject = e.get('subject', '')
    sender = e.get('sender_email', '').lower()
    body = e.get('body', '') or ''

    # 1. Already in DB?
    if gmail_id in existing_ids:
        d = 'skip_already_in_db'
        reason = 'already in DB'
        kw = None
    # 2. Self?
    elif 'pemnet26@gmail.com' in sender:
        d = 'skip_self'
        reason = 'sent by pemnet26'
        kw = None
    else:
        # 3. should_skip_email
        s_skip, s_reason = should_skip_email(subject, body, sender)
        if s_skip:
            d = 'skip_notification'
            reason = s_reason
            kw = s_reason
        # 4. invitation
        elif is_invitation_email(subject, body):
            d = 'skip_invitation'
            reason = 'is_invitation_email = True'
            kw = None
        # 5. abstract?
        elif not is_abstract_submission(subject, body, sender):
            d = 'skip_not_abstract'
            reason = 'is_abstract_submission = False'
            kw = None
        else:
            d = 'would_process'
            reason = 'accept'
            kw = None

    decisions[d] = decisions.get(d, 0) + 1

    # Track Solomo specifically
    if 'solomo' in sender or 'solomo' in subject.lower():
        solomo_decision = (gmail_id, subject, d, reason, kw)
        print(f"\n🎯 SOLOMO FOUND IN FETCHED LIST")
        print(f"   gmail_id: {gmail_id}")
        print(f"   subject:  {subject}")
        print(f"   decision: {d}")
        print(f"   reason:   {reason}")
        print(f"   keyword:  {kw}")

print("\n" + "=" * 70)
print("DECISION SUMMARY")
print("=" * 70)
for d, n in decisions.items():
    print(f"  {d:<25} {n}")

print("\n" + "=" * 70)
if solomo_decision is None:
    print("❌ SOLOMO WAS NOT IN THE FETCHED LIST")
    print("   That means the query returned 148 emails, and none of them were hers.")
    print("   Even though Test 1 earlier found her with a narrow query.")
    print("   → The wide query is dropping her. Pagination bug.")
else:
    print("✅ SOLOMO WAS IN THE FETCHED LIST")
    print(f"   Her decision: {solomo_decision[2]}")
    print(f"   Reason:       {solomo_decision[3]}")
print("=" * 70)

# Also print the oldest and newest dates fetched
dates = sorted([e['received_date'] for e in emails if e.get('received_date')])
if dates:
    print(f"\nDate range: {dates[0]} → {dates[-1]}")

# And check: how many emails in the fetched list have a received_date in August 2026?
aug = [e for e in emails if e.get('received_date') and e['received_date'].strftime('%Y-%m') == '2026-08']
print(f"Emails with received_date in 2026-08: {len(aug)}")
for e in aug:
    print(f"  {e['received_date']} | {e['sender_email']} | {e['subject'][:60]}")