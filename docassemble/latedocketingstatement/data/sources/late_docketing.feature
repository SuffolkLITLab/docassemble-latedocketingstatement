@story_table
Feature: Choose the correct motion and prepare a truthful late-entry packet

@basic
Scenario: Civil appellant has not served copies and has no Appeals Court number
  Given I start the interview at "late_docketing_statement.yml"
  And I wait 1 second
  When I get to the question id "download late docketing motion" with this data:
    | var | value |
    | acknowledged_information_use | True |
    | late_entry_intro | True |
    | civil_self_represented | True |
    | notice_filed | True |
    | assembly_received | True |
    | appeal_dismissed | False |
    | dismissal_motion_pending | False |
    | users[0].name.first | Taylor |
    | users[0].name.last | Green |
    | users[0].address.address | 42 Elm St |
    | users[0].address.city | Boston |
    | users[0].address.state | MA |
    | users[0].address.zip | 02108 |
    | contact_phone | 6175550100 |
    | contact_email | taylor@example.com |
    | case_caption | Taylor Green v. Morgan Rivera |
    | trial_court_name | Suffolk Superior Court |
    | trial_docket_number | 2684CV01234 |
    | has_appeals_number | False |
    | notice_date | today - 21 |
    | excuse_description | I was hospitalized and could not arrange payment until I returned home. |
    | issue_description | The trial court excluded my receipts without a hearing. |
    | opposition_status | I do not know the other parties' positions on this motion. |
    | service_recipients | Morgan Rivera, 10 Main St, Boston MA 02108 |
    | service_done | False |
    | has_documents | False |
    | filing_information | True |
    | late_docketing_statement_preview | True |
  Then I SHOULD see the phrase "You have not filed anything yet."
  And the text in the JSON variable "trial_docket_number" should be
    """
    2684CV01234
    """
  And I download "late_appeal_motion.pdf"

@multi
Scenario: Multiple recipients have been served and a dismissal motion is pending
  Given I start the interview at "late_docketing_statement.yml"
  And I wait 1 second
  When I get to the question id "download late docketing motion" with this data:
    | var | value |
    | acknowledged_information_use | True |
    | late_entry_intro | True |
    | civil_self_represented | True |
    | notice_filed | True |
    | assembly_received | True |
    | appeal_dismissed | False |
    | dismissal_motion_pending | True |
    | pending_dismissal_warning | True |
    | users[0].name.first | Taylor |
    | users[0].name.last | Green |
    | users[0].address.address | 42 Elm St |
    | users[0].address.city | Boston |
    | users[0].address.state | MA |
    | users[0].address.zip | 02108 |
    | contact_phone | 6175550100 |
    | contact_email | taylor@example.com |
    | case_caption | Taylor Green v. Morgan Rivera and Casey Chen |
    | trial_court_name | Suffolk Superior Court |
    | trial_docket_number | 2684CV01234 |
    | has_appeals_number | True |
    | appeals_docket_number | 2026-J-0123 |
    | notice_date | today - 30 |
    | excuse_description | I was hospitalized and could not arrange payment until I returned home. |
    | issue_description | The trial court excluded my receipts without a hearing. |
    | opposition_status | At least one party plans to oppose this motion. |
    | service_recipients | Alex Lawyer, 10 Main St, Boston MA 02108; Casey Chen, 11 Main St, Boston MA 02108 |
    | service_done | True |
    | service_date | today - 1 |
    | service_method | First-class mail to both recipients |
    | has_documents | True |
    | supporting_documents | synthetic_supporting_document.png |
    | filing_information | True |
    | late_docketing_statement_preview | True |
  Then I SHOULD see the phrase "Your motion is ready to download"
  And the text in the JSON variable "trial_docket_number" should be
    """
    2684CV01234
    """
  And I download "late_appeal_motion.pdf"
  And the text in the JSON variable "appeals_docket_number" should be
    """
    2026-J-0123
    """
  And I download "supporting_documents.pdf"
  And I download "late_appeal_package.pdf"


Scenario: Person who has not filed a notice of appeal gets the correct next step
  Given I start the interview at "late_docketing_statement.yml"
  And I wait 1 second
  When I get to the question id "wrong motion" with this data:
    | var | value |
    | acknowledged_information_use | True |
    | late_entry_intro | True |
    | civil_self_represented | True |
    | notice_filed | False |
    | assembly_received | False |
  Then I SHOULD see the phrase "You may need a different step"
  And I SHOULD see the phrase "Change my answers"
