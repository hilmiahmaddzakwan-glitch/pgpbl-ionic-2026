import { Component, OnInit, inject } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import * as L from 'leaflet';
import { DataService } from '../data.service';

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false,
})
export class CreatepointPage implements OnInit {
  name = '';
  coordinates = '';
  map!: L.Map;

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {
    if (this.map) {
      return;
    }

    setTimeout(() => {
      const iconRetinaUrl = 'assets/icon/marker-icon-2x.png';
      const iconUrl = 'assets/icon/marker-icon.png';
      const shadowUrl = 'assets/icon/marker-shadow.png';

      const iconDefault = L.icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });

      L.Marker.prototype.options.icon = iconDefault;

      this.map = L.map('mapcreate').setView([-7.7956, 110.3695], 13);

      const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      );

      const esri = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'ESRI',
        },
      );

      osm.addTo(this.map);

      const baseMaps = {
        OpenStreetMap: osm,
        'Esri World Imagery': esri,
      };

      L.control.layers(baseMaps).addTo(this.map);

      const tooltip =
        'Drag the marker or move the map<br>to change the coordinates<br>of the location';

      const marker = L.marker([-7.7956, 110.3695], {
        draggable: true,
      });

      marker.addTo(this.map);
      marker.bindPopup(tooltip);
      marker.openPopup();

      marker.on('dragend', event => {
        const latlng = event.target.getLatLng();
        const lat = latlng.lat.toFixed(9);
        const lng = latlng.lng.toFixed(9);

        this.coordinates = `${lat},${lng}`;
      });

      window.dispatchEvent(new Event('resize'));
    }, 0);
  }

  async save() {
    if (!this.name.trim() || !this.coordinates.trim()) {
      const alert = await this.alertCtrl.create({
        header: 'Validation Error',
        message: 'Name and coordinates are required.',
        buttons: ['OK'],
      });

      await alert.present();
      return;
    }

    try {
      const pointData = {
        name: this.name,
        coordinates: this.coordinates,
      };

      await this.dataService.savePoint(pointData);
      this.name = '';
      this.coordinates = '';
      this.navCtrl.back();
    } catch (error: any) {
      const alert = await this.alertCtrl.create({
        header: 'Save Failed',
        message: error.message,
        buttons: ['OK'],
      });

      await alert.present();
    }
  }
}
