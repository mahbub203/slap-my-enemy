from rest_framework import serializers
from .models import GameCharacter, StressReliefSession

class GameCharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameCharacter
        fields = [
            'id',
            'name',
            'style',
            'original_image',
            'stylized_texture',
            'accent_color',
            'session_id',
            'consent_given',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'stylized_texture']


class CharacterCreateRequestSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=64, default='My Enemy')
    style = serializers.ChoiceField(
        choices=GameCharacter.STYLE_CHOICES,
        default='cartoon-3d'
    )
    accent_color = serializers.CharField(max_length=16, default='#ec4899')
    session_id = serializers.CharField(max_length=128)
    consent_given = serializers.BooleanField(required=True)
    image = serializers.ImageField(required=False, allow_null=True)
    rotation = serializers.IntegerField(default=0)
    brightness = serializers.IntegerField(default=0)
    contrast = serializers.IntegerField(default=0)
    saturation = serializers.IntegerField(default=0)

    def validate_consent_given(self, value):
        if not value:
            raise serializers.ValidationError("Explicit user consent is mandatory for avatar generation.")
        return value


class StressReliefSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StressReliefSession
        fields = [
            'session_id',
            'total_score',
            'max_combo',
            'total_hits',
            'created_at',
            'updated_at'
        ]
