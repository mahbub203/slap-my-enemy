import os
import uuid
from io import BytesIO
from PIL import Image, ImageDraw
from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import RetrieveDestroyAPIView

from .models import GameCharacter, StressReliefSession
from .serializers import (
    GameCharacterSerializer,
    CharacterCreateRequestSerializer,
    StressReliefSessionSerializer
)
from .services.image_processor import validate_image_file, preprocess_and_crop
from .services.ai_character_service import generate_ai_character

class HealthCheckView(APIView):
    """Healthcheck endpoint reporting backend status and AI configuration."""
    def get(self, request):
        has_gemini_key = bool(os.getenv('GEMINI_API_KEY', '').strip())
        return Response({
            'status': 'online',
            'service': 'SLAP MY ENEMY: BANGLADESH EDITION Backend API',
            'edition': 'Bangladesh Edition',
            'ai_mode': 'Gemini AI' if has_gemini_key else 'Offline Algorithmic Caricature Engine',
            'version': '2.0.0'
        })


class ScenarioListView(APIView):
    """Returns the authentic Bangladesh scenarios metadata."""
    def get(self, request):
        scenarios = [
            {
                'id': 'dhaka-street',
                'name_bn': 'ঢাকার ব্যস্ত রাস্তা',
                'name_en': 'Dhaka City Street',
                'tagline': 'Rickshaws, CNGs, local buses & urban hustle',
                'ambience': 'Rickshaw bell, traffic & CNG horn',
                'icon': '🛺'
            },
            {
                'id': 'village',
                'name_bn': 'সবুজ গ্রামবাংলা',
                'name_en': 'Bangladeshi Village',
                'tagline': 'Serene courtyard, green ponds & tin-roof huts',
                'ambience': 'Birdsong & soft village breeze',
                'icon': '🌴'
            },
            {
                'id': 'campus',
                'name_bn': 'বিশ্ববিদ্যালয় ক্যাম্পাস',
                'name_en': 'University Campus',
                'tagline': 'Colonial red-brick pillars, cafeteria & adda',
                'ambience': 'Campus banter & cafeteria ambience',
                'icon': '🏛️'
            },
            {
                'id': 'bazar',
                'name_bn': 'লোকাল কাঁচাবাজার',
                'name_en': 'Local Kacha Bazar',
                'tagline': 'Vegetable stalls, fish market & bargaining',
                'ambience': 'Bazar vendor calls & market chatter',
                'icon': '🛒'
            },
            {
                'id': 'rooftop',
                'name_bn': 'ঢাকার ছাদ ও গোধূলি',
                'name_en': 'Dhaka Rooftop Sunset',
                'tagline': 'Water tanks, clotheslines & dusk skyline',
                'ambience': 'Distant city hum & evening breeze',
                'icon': '🌆'
            },
            {
                'id': 'eid-festival',
                'name_bn': 'ঈদ উৎসব ও মেলা',
                'name_en': 'Eid Festival Fair',
                'tagline': 'Illuminated fairground, crescent lights & joy',
                'ambience': 'Festive celebration sounds & melodies',
                'icon': '🌙'
            }
        ]
        return Response(scenarios)


class CharacterGenerateView(APIView):
    """
    Primary Character Generation Endpoint:
    Processes user uploaded photo with explicit consent, generates stylized 3D avatar textures,
    and returns rigged character configuration.
    """
    def post(self, request):
        serializer = CharacterCreateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        session_id = data['session_id']
        name = data.get('name', 'My Enemy')
        style = data.get('style', 'cartoon-3d')
        accent_color = data.get('accent_color', '#ec4899')
        image_file = data.get('image')

        # Create or pre-process image
        if image_file:
            try:
                validate_image_file(image_file)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            preprocessed_img = preprocess_and_crop(
                image_file,
                rotation=data.get('rotation', 0),
                brightness=data.get('brightness', 0),
                contrast=data.get('contrast', 0),
                saturation=data.get('saturation', 0)
            )
        else:
            # Procedural base face if no image is uploaded
            preprocessed_img = Image.new('RGB', (512, 512), color=(251, 208, 176))
            draw = ImageDraw.Draw(preprocessed_img)
            draw.ellipse([100, 80, 412, 432], fill=(251, 208, 176))
            draw.ellipse([140, 180, 210, 250], fill=(255, 255, 255), outline=(0, 0, 0), width=4)
            draw.ellipse([302, 180, 372, 250], fill=(255, 255, 255), outline=(0, 0, 0), width=4)
            draw.arc([180, 320, 332, 400], 0, 180, fill=(0, 0, 0), width=6)

        # Generate stylized fictional texture
        stylized_io = generate_ai_character(preprocessed_img, style=style, char_name=name)

        # Create character instance in DB
        character = GameCharacter(
            name=name,
            style=style,
            accent_color=accent_color,
            session_id=session_id,
            consent_given=True
        )

        char_id = uuid.uuid4()
        character.id = char_id

        # Save original and stylized images
        orig_io = BytesIO()
        preprocessed_img.save(orig_io, format='PNG')
        character.original_image.save(f"orig_{char_id}.png", ContentFile(orig_io.getvalue()), save=False)
        character.stylized_texture.save(f"stylized_{char_id}.png", ContentFile(stylized_io.getvalue()), save=True)

        return Response(GameCharacterSerializer(character, context={'request': request}).data, status=status.HTTP_201_CREATED)


class CharacterDetailDeleteView(RetrieveDestroyAPIView):
    """
    Retrieve or permanently delete a character and its associated media files.
    """
    queryset = GameCharacter.objects.all()
    serializer_class = GameCharacterSerializer
    lookup_field = 'pk'


class SessionCleanupView(APIView):
    """
    Privacy Endpoint: Permanently removes all images and characters associated with a session ID.
    """
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'session_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        chars = GameCharacter.objects.filter(session_id=session_id)
        count = chars.count()
        for char in chars:
            char.delete()

        return Response({
            'message': f'Session cleared. Deleted {count} avatar(s) and their associated media.',
            'deleted_count': count
        })


class SessionStatsUpdateView(APIView):
    """
    Update or fetch stress relief session statistics.
    """
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'session_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        session, _ = StressReliefSession.objects.get_or_create(session_id=session_id)
        session.total_score = max(session.total_score, int(request.data.get('total_score', 0)))
        session.max_combo = max(session.max_combo, int(request.data.get('max_combo', 0)))
        session.total_hits += int(request.data.get('hits_added', 0))
        session.save()

        return Response(StressReliefSessionSerializer(session).data)
