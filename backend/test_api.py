import httpx

BASE_URL = "http://localhost:8000"


def test_health():
    response = httpx.get(f"{BASE_URL}/api/health")
    print(f"Health: {response.status_code}")
    print(response.json())
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    print("  PASSED\n")


def test_languages():
    response = httpx.get(f"{BASE_URL}/api/languages")
    print(f"Languages: {response.status_code}")
    data = response.json()
    print(f"  {len(data)} languages returned")
    assert response.status_code == 200
    assert len(data) == 9
    codes = [lang["code"] for lang in data]
    assert "en" in codes
    assert "zu" in codes
    print(f"  Codes: {codes}")
    print("  PASSED\n")


if __name__ == "__main__":
    print("--- Gudani Bot API Tests ---\n")
    test_health()
    test_languages()
    print("All tests passed!")
