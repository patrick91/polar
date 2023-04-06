import unittest
from unittest.mock import ANY
import uuid
import pytest
from polar.models.issue import Issue
from polar.models.notification import Notification
from polar.models.organization import Organization
from polar.models.pledge import Pledge
from polar.models.pull_request import PullRequest
from polar.models.repository import Repository
from polar.models.user import User
from polar.notifications.schemas import NotificationType
from polar.notifications.tasks.email import (
    MetadataMaintainerPledgeCreated,
    MetadataPledgedIssueBranchCreated,
    MetadataPledgedIssuePullRequestCreated,
    MetadataPledgedIssuePullRequestMerged,
    email_metadata,
    render_email,
)
from polar.postgres import AsyncSession


@pytest.mark.asyncio
async def test_maintainer_pledge_created_metadata(
    session: AsyncSession,
    organization: Organization,
    pledging_organization: Organization,
    repository: Repository,
    issue: Issue,
    user: User,
    pledge_as_org: Pledge,
) -> None:
    notif = await Notification.create(
        session=session,
        id=uuid.uuid4(),
        organization_id=organization.id,
        issue_id=issue.id,
        type=NotificationType.issue_pledge_created,
        dedup_key="test1",
        pledge_id=pledge_as_org.id,
    )

    res = await email_metadata(session, user, notif)

    assert res is not None
    assert res == MetadataMaintainerPledgeCreated(
        username="foobar",
        pledger_name="pledging_org",
        issue_url="https://github.com/testorg/testrepo/issues/123",
        issue_title="issue title",
        pledge_amount="123.45",
    )

    # render it
    rendered = render_email(res)
    assert (
        rendered
        == """Hi foobar,

pledging_org has pledged $123.45 to <a href="https://github.com/testorg/testrepo/issues/123">issue title</a>."""  # noqa: E501
    )


@pytest.mark.asyncio
async def test_pledger_pull_request_created(
    session: AsyncSession,
    organization: Organization,
    pledging_organization: Organization,
    repository: Repository,
    issue: Issue,
    user: User,
    pledge_as_org: Pledge,
    pull_request: PullRequest,
) -> None:

    notif = await Notification.create(
        session=session,
        id=uuid.uuid4(),
        organization_id=pledging_organization.id,
        issue_id=issue.id,
        type=NotificationType.issue_pledged_pull_request_created,
        dedup_key="test2",
        pledge_id=pledge_as_org.id,
        pull_request_id=pull_request.id,
    )

    res = await email_metadata(session, user, notif)

    assert res is not None
    assert res == MetadataPledgedIssuePullRequestCreated(
        username="foobar",
        issue_url="https://github.com/testorg/testrepo/issues/123",
        issue_title="issue title",
        pull_request_url="https://github.com/testorg/testrepo/pull/5555",
        pull_request_title="PR Title",
        pull_request_creator_username="pr_creator_login",
        repo_owner="testorg",
        repo_name="testrepo",
    )

    # render it
    rendered = render_email(res)
    assert (
        rendered
        == """Hi foobar,

pr_creator_login just opened a <a href="https://github.com/testorg/testrepo/pull/5555">pull request</a> to testorg/testrepo that solves
the issue <a href="https://github.com/testorg/testrepo/issues/123">issue title</a> that you've backed!"""  # noqa: E501
    )


@pytest.mark.asyncio
async def test_pledger_pull_request_merged(
    session: AsyncSession,
    organization: Organization,
    pledging_organization: Organization,
    repository: Repository,
    issue: Issue,
    user: User,
    pledge_as_org: Pledge,
    pull_request: PullRequest,
) -> None:

    notif = await Notification.create(
        session=session,
        id=uuid.uuid4(),
        organization_id=pledging_organization.id,
        issue_id=issue.id,
        type=NotificationType.issue_pledged_pull_request_merged,
        dedup_key="test3",
        pledge_id=pledge_as_org.id,
        pull_request_id=pull_request.id,
    )

    res = await email_metadata(session, user, notif)

    assert res is not None
    assert res == MetadataPledgedIssuePullRequestMerged(
        username="foobar",
        issue_url="https://github.com/testorg/testrepo/issues/123",
        issue_title="issue title",
        pull_request_url="https://github.com/testorg/testrepo/pull/5555",
        pull_request_title="PR Title",
        pull_request_creator_username="pr_creator_login",
        repo_owner="testorg",
        repo_name="testrepo",
    )

    # render it
    rendered = render_email(res)
    assert (
        rendered
        == """Hi foobar,

pr_creator_login just merged a <a href="https://github.com/testorg/testrepo/pull/5555">pull request</a> to testorg/testrepo that solves
the issue <a href="https://github.com/testorg/testrepo/issues/123">issue title</a> that you've backed!

The money will soon be paid out to testorg."""  # noqa: E501
    )


@pytest.mark.asyncio
async def test_pledger_branch_created(
    session: AsyncSession,
    organization: Organization,
    pledging_organization: Organization,
    repository: Repository,
    issue: Issue,
    user: User,
    pledge_as_org: Pledge,
) -> None:

    notif = await Notification.create(
        session=session,
        id=uuid.uuid4(),
        organization_id=pledging_organization.id,
        issue_id=issue.id,
        type=NotificationType.issue_pledged_branch_created,
        dedup_key="test4",
        pledge_id=pledge_as_org.id,
    )

    res = await email_metadata(session, user, notif)

    assert res is not None
    assert res == MetadataPledgedIssueBranchCreated(
        username="foobar",
        issue_url="https://github.com/testorg/testrepo/issues/123",
        issue_title="issue title",
        branch_creator_username="happy_coder",
    )

    # render it
    rendered = render_email(res)
    assert (
        rendered
        == """Hi foobar,

pr_creator_login just merged a <a href="https://github.com/testorg/testrepo/pull/5555">pull request</a> to testorg/testrepo that solves
the issue <a href="https://github.com/testorg/testrepo/issues/123">issue title</a> that you've backed!

The money will soon be paid out to testorg."""  # noqa: E501
    )
