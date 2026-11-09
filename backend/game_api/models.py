import uuid
import os
from django.db import models

class GameCharacter(models.Model):
    STYLE_CHOICES = [
        ('cartoon-3d', 'Cartoon 3D'),
        ('caricature', 'Funny Caricature'),
        ('pixel-art', 'Pixel Art'),
        ('comic', 'Comic Book'),
        ('low-poly', 'Low-Poly Game'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=64, default='My Enemy')
    style = models.CharField(max_length=32, choices=STYLE_CHOICES, default='cartoon-3d')
    original_image = models.ImageField(upload_to='uploads/', null=True, blank=True)
    stylized_texture = models.ImageField(upload_to='generated/', null=True, blank=True)
    accent_color = models.CharField(max_length=16, default='#ec4899')
    session_id = models.CharField(max_length=128, db_index=True)
    consent_given = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.style})"

    def delete(self, *args, **kwargs):
        # Secure deletion: remove files from disk when character is deleted
        if self.original_image and os.path.isfile(self.original_image.path):
            try:
                os.remove(self.original_image.path)
            except OSError:
                pass

        if self.stylized_texture and os.path.isfile(self.stylized_texture.path):
            try:
                os.remove(self.stylized_texture.path)
            except OSError:
                pass

        super().delete(*args, **kwargs)


class StressReliefSession(models.Model):
    session_id = models.CharField(max_length=128, unique=True, db_index=True)
    total_score = models.IntegerField(default=0)
    max_combo = models.IntegerField(default=0)
    total_hits = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.session_id} - Score: {self.total_score}"
