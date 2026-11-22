"""Check motion, affidavit and service output across filing situations."""
from pathlib import Path
from types import SimpleNamespace
from docxtpl import DocxTemplate
from docx import Document
import pytest

TEMPLATE = Path(__file__).parents[1] / 'docassemble/latedocketingstatement/data/templates/late_docketing_statement.docx'
class Person:
    address = SimpleNamespace(block=lambda: '42 Elm St\nBoston, MA 02108', on_one_line=lambda: '42 Elm St, Boston, MA 02108')
    def __str__(self):
        return 'Taylor Green'

@pytest.mark.parametrize('served,number,pending', [(False,False,False),(True,True,True)])
def test_motion_and_affidavit_preserve_answers(tmp_path,served,number,pending):
    reasons='I was in the hospital from November 1 to November 18. '*35
    context=dict(users=[Person()],case_caption='Taylor Green v. Morgan Rivera and Casey Chen',trial_court_name='Suffolk Superior Court',trial_docket_number='2684CV01234',has_appeals_number=number,notice_date='November 1, 2026',excuse_description=reasons,issue_description='The court excluded my receipts without a hearing.',opposition_status='I do not know the other parties\' positions on this motion.',dismissal_motion_pending=pending,contact_phone='',contact_email='',service_recipients='Alex Lawyer, 10 Main St, Boston, MA 02108\nCasey Chen, 11 Main St, Boston, MA 02108',service_done=served)
    if number:context['appeals_docket_number']='2026-J-0123'
    if served:context.update(service_date='November 20, 2026',service_method='First-class mail to both recipients')
    template=DocxTemplate(TEMPLATE);template.render(context);output=tmp_path/'motion.docx';template.save(output)
    text='\n'.join(p.text for p in Document(output).paragraphs)
    assert '{{' not in text and '{%' not in text
    assert reasons in text and 'Casey Chen' in text
    assert 'Affidavit in Support of Motion' in text
    assert 'penalties of perjury' in text and 'Signature:' in text
    assert 'will serve' not in text
    assert ('November 20, 2026' in text)==served
    assert ('2026-J-0123' in text)==number
    assert ('A motion to dismiss my appeal is pending' in text)==pending
    if not served:assert 'Date service was completed: ____________________' in text

def test_no_embedded_private_financial_documents():
    yaml=(TEMPLATE.parents[1]/'questions/late_docketing_statement.yml').read_text()
    assert 'affidavitofindigency_attachment' not in yaml
    assert '/start/indigency/' in yaml
    assert 'Filing fee: 315' in yaml
