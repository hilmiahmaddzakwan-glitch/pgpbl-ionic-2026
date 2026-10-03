import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DataService } from '../data.service';

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  standalone: false,
})
export class EditpointPage implements OnInit {
  key = '';
  name = '';
  coordinates = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  async ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') ?? '';
    if (!this.key) {
      await this.showError('Point key is missing.');
      await this.router.navigate(['/tabs/maps']);
      return;
    }

    try {
      const point = await this.dataService.getPoint(this.key);
      if (!point) {
        await this.showError('Point not found.');
        await this.router.navigate(['/tabs/maps']);
        return;
      }

      this.name = point.name;
      this.coordinates = point.coordinates;
    } catch (error: any) {
      await this.showError(error.message);
    }
  }

  async save() {
    if (!this.name.trim() || !this.coordinates.trim()) {
      await this.showError('Name and coordinates are required.');
      return;
    }

    try {
      await this.dataService.updatePoint(this.key, {
        name: this.name,
        coordinates: this.coordinates,
      });
      await this.router.navigate(['/tabs/maps']);
    } catch (error: any) {
      await this.showError(error.message);
    }
  }

  private async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Point',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
