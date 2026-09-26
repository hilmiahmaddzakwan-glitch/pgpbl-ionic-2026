import { Component, inject } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';
  isSubmitting = false;
  showPassword = false;

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
      case 'auth/invalid-credential':
        return 'Email atau password yang Anda masukkan salah. Silakan periksa kembali.';
      case 'auth/user-not-found':
        return 'Akun dengan email tersebut tidak ditemukan.';
      case 'auth/wrong-password':
        return 'Password yang Anda masukkan salah.';
      case 'auth/invalid-email':
        return 'Format email tidak valid. Silakan periksa kembali.';
      case 'auth/user-disabled':
        return 'Akun ini telah dinonaktifkan.';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan login. Silakan coba lagi beberapa saat kemudian.';
      default:
        return 'Login gagal. Silakan coba lagi.';
    }
  }

  private validateLoginForm(): string | null {
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

    return null;
  }

  async login() {
    const validationMessage = this.validateLoginForm();

    if (validationMessage) {
      await this.showAuthAlert('Login Gagal', validationMessage);
      return;
    }

    this.isSubmitting = true;

    try {
      await this.authService.login(this.getEmailValue(), this.password);
      this.navCtrl.navigateRoot('/tabs');
    } catch (error: any) {
      const message = this.getFriendlyErrorMessage(error?.code);
      await this.showAuthAlert('Login Gagal', message);
    } finally {
      this.isSubmitting = false;
    }
  }
}
