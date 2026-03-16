"""MeetFlow API Tests - Health and Process endpoints"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

SAMPLE_TRANSCRIPT = (
    "John asks Mary to complete the report by tomorrow. "
    "Alice will send the slides by end of week. "
    "Bob should review the budget today. "
    "The team decided to use React for the frontend. "
    "Everyone agreed to hold weekly standups."
)


class TestHealth:
    def test_health_returns_ok(self):
        res = requests.get(f"{BASE_URL}/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data.get("status") == "ok"
        print(f"Health OK - hf_configured: {data.get('hf_configured')}")


class TestProcess:
    def test_process_with_text_input(self):
        res = requests.post(f"{BASE_URL}/api/process", json={
            "content": SAMPLE_TRANSCRIPT,
            "input_type": "text",
            "custom_instructions": ""
        }, timeout=60)
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert "action_items" in data
        assert "key_decisions" in data
        assert isinstance(data["summary"], str) and len(data["summary"]) > 0
        assert isinstance(data["action_items"], list)
        assert isinstance(data["key_decisions"], list)
        print(f"Summary (first 100 chars): {data['summary'][:100]}")
        print(f"Action items count: {len(data['action_items'])}")
        print(f"Key decisions count: {len(data['key_decisions'])}")

    def test_action_items_have_required_fields(self):
        res = requests.post(f"{BASE_URL}/api/process", json={
            "content": SAMPLE_TRANSCRIPT,
            "input_type": "text",
            "custom_instructions": ""
        }, timeout=60)
        assert res.status_code == 200
        data = res.json()
        for item in data["action_items"]:
            assert "assignee" in item
            assert "assigner" in item
            assert "action" in item
            assert "due_date" in item
        print(f"Action items validated: {data['action_items']}")

    def test_process_empty_content_returns_400(self):
        res = requests.post(f"{BASE_URL}/api/process", json={
            "content": "",
            "input_type": "text"
        }, timeout=30)
        assert res.status_code == 400
        print("Empty content correctly returns 400")

    def test_process_vtt_input(self):
        vtt_content = """WEBVTT

1
00:00:01.000 --> 00:00:05.000
<v John>John asks Mary to finish the presentation by tomorrow.</v>

2
00:00:06.000 --> 00:00:10.000
<v Alice>Alice will send the invites by end of week.</v>
"""
        res = requests.post(f"{BASE_URL}/api/process", json={
            "content": vtt_content,
            "input_type": "vtt",
            "custom_instructions": ""
        }, timeout=60)
        assert res.status_code == 200
        data = res.json()
        assert len(data["summary"]) > 0
        print(f"VTT processed OK, summary: {data['summary'][:80]}")

    def test_process_with_custom_instructions(self):
        res = requests.post(f"{BASE_URL}/api/process", json={
            "content": SAMPLE_TRANSCRIPT,
            "input_type": "text",
            "custom_instructions": "Focus on technical items"
        }, timeout=60)
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        print("Custom instructions accepted OK")
