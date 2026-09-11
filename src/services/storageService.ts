import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const storageService = {
  isConfigured: () => isSupabaseConfigured,

  // Upload du logo de l'école
  async uploadSchoolLogo(file: File): Promise<{ url: string | null; error?: string }> {
    if (!supabase) {
      return this.readFileAsDataUrl(file);
    }

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('school-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.warn('Erreur Supabase Storage upload, fallback base64:', uploadError.message);
        return this.readFileAsDataUrl(file);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('school-assets')
        .getPublicUrl(filePath);

      return { url: publicUrl };
    } catch (err: any) {
      return this.readFileAsDataUrl(file);
    }
  },

  // Upload du cachet / tampon officiel
  async uploadSchoolStamp(file: File): Promise<{ url: string | null; error?: string }> {
    if (!supabase) {
      return this.readFileAsDataUrl(file);
    }

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `stamp_${Date.now()}.${fileExt}`;
      const filePath = `stamps/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('school-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        return this.readFileAsDataUrl(file);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('school-assets')
        .getPublicUrl(filePath);

      return { url: publicUrl };
    } catch (err: any) {
      return this.readFileAsDataUrl(file);
    }
  },

  // Upload de la photo d'identité d'un élève
  async uploadStudentAvatar(studentId: string, file: File): Promise<{ url: string | null; error?: string }> {
    if (!supabase) {
      return this.readFileAsDataUrl(file);
    }

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanStudentId = studentId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${cleanStudentId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        return this.readFileAsDataUrl(file);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('student-avatars')
        .getPublicUrl(filePath);

      return { url: publicUrl };
    } catch (err: any) {
      return this.readFileAsDataUrl(file);
    }
  },

  // Utilitaire pour convertir un fichier en base64 (fallback local/hors ligne)
  readFileAsDataUrl(file: File): Promise<{ url: string; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ url: reader.result as string });
      };
      reader.onerror = () => {
        resolve({ url: '', error: 'Impossible de lire le fichier image.' });
      };
      reader.readAsDataURL(file);
    });
  }
};
