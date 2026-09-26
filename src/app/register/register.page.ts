import { Component, inject } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  email = '';
  password = '';
  confirmPassword = '';
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private authService = inject(AuthService);

  private getEmailValue() {
    return this.email.trim();
  }

  private async showAuthAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private getFriendlyErrorMessage(code?: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email tersebut sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun tersebut.';
      case 'auth/invalid-email':
        return 'Format email tidak valid.';
      case 'auth/weak-password':
        return 'Password terlalu lemah. Gunakan password yang lebih kuat.';
      case 'auth/password-does-not-meet-requirements':
        return 'Password belum memenuhi persyaratan keamanan.';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat kemudian.';
      default:
        return 'Registrasi gagal. Silakan coba lagi.';
    }
  }

  private validateRegisterForm(): string | null {
    const normalizedEmail = this.getEmailValue();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      return 'Email wajib diisi.';
    }

    if (!emailRegex.test(normalizedEmail)) {
      return 'Format email tidak valid.';
    }

    if (!this.password) {
      return 'Password wajib diisi.';
    }

    if (!this.confirmPassword) {
      return 'Konfirmasi password wajib diisi.';
    }

    if (this.password !== this.confirmPassword) {
      return 'Password dan konfirmasi password tidak sama.';
    }

    return null;
  }

  async register() {
    const validationMessage = this.validateRegisterForm();

    if (validationMessage) {
      await this.showAuthAlert('Registrasi Gagal', validationMessage);
      return;
    }

    this.isSubmitting = true;

    try {
      await this.authService.register(this.getEmailValue(), this.password);
      await this.showAuthAlert('Registrasi Berhasil', 'Akun berhasil dibuat. Silakan masuk dengan akun baru Anda.');
      this.navCtrl.navigateBack('/login');
    } catch (error: any) {
      const message = this.getFriendlyErrorMessage(error?.code);
      await this.showAuthAlert('Registrasi Gagal', message);
    } finally {
      this.isSubmitting = false;
    }
  }
}
