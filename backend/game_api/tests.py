import os
import io
import uuid
from PIL import Image
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from .models import GameCharacter, StressReliefSession
from .services.image_processor import validate_image_file, preprocess_and_crop
from .services.mock_character_generator import generate_mock_character

class CharacterApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.session_id = f"test-session-{uuid.uuid4()}"

    def create_test_image(self, format='JPEG', size=(200, 200), color=(255, 0, 0)):
        """Utility to generate a dummy image in memory."""
        file_obj = io.BytesIO()
        image = Image.new('RGB', size, color)
        image.save(file_obj, format=format)
        file_obj.seek(0)
        return SimpleUploadedFile(f"test.{format.lower()}", file_obj.read(), content_type=f"image/{format.lower()}")

    def test_health_check(self):
        """Test healthcheck endpoint returns 200 and operational status."""
        url = reverse('api-health')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'online')

    def test_scenarios_list(self):
        """Test scenario list endpoint returns all 6 Bangladesh scenarios."""
        url = reverse('scenarios-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 6)
        ids = [sc['id'] for sc in response.data]
        self.assertIn('dhaka-street', ids)
        self.assertIn('village', ids)
        self.assertIn('campus', ids)
        self.assertIn('bazar', ids)
        self.assertIn('rooftop', ids)
        self.assertIn('eid-festival', ids)

    def test_image_validation(self):
        """Test image validation accepts valid JPG and rejects invalid formats."""
        valid_img = self.create_test_image('JPEG')
        self.assertTrue(validate_image_file(valid_img))

        # Test invalid extension
        fake_file = SimpleUploadedFile("malicious.exe", b"executable code", content_type="application/octet-stream")
        with self.assertRaises(ValueError):
            validate_image_file(fake_file)

    def test_mock_character_generator_all_styles(self):
        """Test algorithmic generator produces valid image buffers for all 5 styles."""
        styles = ['cartoon-3d', 'caricature', 'pixel-art', 'comic', 'low-poly']
        base_img = Image.new('RGB', (256, 256), color=(200, 150, 100))

        for s in styles:
            buf = generate_mock_character(base_img, s)
            self.assertIsNotNone(buf)
            buf.seek(0)
            result_img = Image.open(buf)
            self.assertEqual(result_img.size, (256, 256))

    def test_character_generation_requires_consent(self):
        """Test that generation fails if explicit consent is not provided."""
        url = reverse('character-generate')
        data = {
            'session_id': self.session_id,
            'name': 'Rival Boss',
            'style': 'cartoon-3d',
            'consent_given': False
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_character_generation_success(self):
        """Test successful character creation with uploaded image and consent."""
        url = reverse('character-generate')
        test_img = self.create_test_image('PNG')
        data = {
            'session_id': self.session_id,
            'name': 'Pixel Rival',
            'style': 'pixel-art',
            'accent_color': '#8b5cf6',
            'consent_given': True,
            'image': test_img
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Pixel Rival')
        self.assertIn('stylized_texture', response.data)

        # Verify DB entry
        char_id = response.data['id']
        char = GameCharacter.objects.get(id=char_id)
        self.assertTrue(os.path.isfile(char.stylized_texture.path))

        # Test privacy deletion: deleting character must delete media files
        char_path = char.stylized_texture.path
        char.delete()
        self.assertFalse(os.path.isfile(char_path))

    def test_session_cleanup(self):
        """Test session cleanup endpoint removes all images associated with session."""
        url_gen = reverse('character-generate')
        test_img = self.create_test_image('JPEG')
        self.client.post(url_gen, {
            'session_id': self.session_id,
            'name': 'Temp Char',
            'style': 'comic',
            'consent_given': True,
            'image': test_img
        }, format='multipart')

        self.assertEqual(GameCharacter.objects.filter(session_id=self.session_id).count(), 1)

        # Trigger cleanup
        url_clean = reverse('session-cleanup')
        response = self.client.post(url_clean, {'session_id': self.session_id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(GameCharacter.objects.filter(session_id=self.session_id).count(), 0)

    def test_session_stats(self):
        """Test recording and updating stress relief session scores."""
        url = reverse('session-stats-update')
        data = {
            'session_id': self.session_id,
            'total_score': 1500,
            'max_combo': 12,
            'hits_added': 15
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_score'], 1500)
        self.assertEqual(response.data['max_combo'], 12)
        self.assertEqual(response.data['total_hits'], 15)
