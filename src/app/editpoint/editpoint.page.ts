import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';
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
  latitude = '';
  longitude = '';
  map!: L.Map;

  private marker?: L.Marker;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  async ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') ?? '';
    this.loadMap();

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

      this.name = point.name ?? '';
      this.coordinates = point.coordinates ?? '';
      this.applyCoordinateInputs(this.coordinates);
      this.updateMarkerFromCurrentCoordinates();
    } catch (error: any) {
      await this.showError(error?.message || 'Unable to load point data.');
      await this.router.navigate(['/tabs/maps']);
    }
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

      this.map = L.map('map-edit').setView([-7.7956, 110.3695], 13);

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
      L.control.layers({ OpenStreetMap: osm, 'Esri World Imagery': esri }).addTo(this.map);

      this.updateMarkerFromCurrentCoordinates();
      window.dispatchEvent(new Event('resize'));
    }, 0);
  }

  async save() {
    if (!this.name.trim()) {
      await this.showError('Point name cannot be empty.');
      return;
    }

    const coordinateValues = this.parseCoordinateValues(this.latitude, this.longitude);
    if (!coordinateValues) {
      await this.showError(
        'Coordinates are invalid. Please enter valid latitude and longitude values.',
      );
      return;
    }

    this.latitude = coordinateValues.lat.toFixed(9);
    this.longitude = coordinateValues.lng.toFixed(9);
    this.coordinates = `${this.latitude},${this.longitude}`;

    try {
      await this.dataService.updatePoint(this.key, {
        name: this.name.trim(),
        coordinates: this.coordinates,
      });
      await this.router.navigate(['/tabs/maps']);
    } catch (error: any) {
      await this.showError(error?.message || 'Failed to update point.');
    }
  }

  private applyCoordinateInputs(coordinates: string) {
    const cleaned = (coordinates ?? '').trim();
    if (!cleaned) {
      this.latitude = '';
      this.longitude = '';
      return;
    }

    const [latValue, lngValue] = cleaned.split(',');
    this.latitude = latValue?.trim() ?? '';
    this.longitude = lngValue?.trim() ?? '';
    this.coordinates = cleaned;
  }

  private parseCoordinateValues(latitude: string, longitude: string) {
    if (!latitude || !longitude) {
      return null;
    }

    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    if (
      !Number.isFinite(latitudeNumber) ||
      !Number.isFinite(longitudeNumber) ||
      latitudeNumber < -90 ||
      latitudeNumber > 90 ||
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {
      return null;
    }

    return {
      lat: latitudeNumber,
      lng: longitudeNumber,
    };
  }

  private updateMarkerFromCurrentCoordinates() {
    if (!this.map) {
      return;
    }

    const parsedCoordinates = this.parseCoordinateValues(this.latitude, this.longitude);
    const latLng = parsedCoordinates
      ? ([parsedCoordinates.lat, parsedCoordinates.lng] as [number, number])
      : ([-7.7956, 110.3695] as [number, number]);

    if (!this.marker) {
      this.marker = L.marker(latLng, { draggable: true }).addTo(this.map);
      this.marker.on('dragend', event => {
        const latLngValue = event.target.getLatLng();
        this.latitude = latLngValue.lat.toFixed(9);
        this.longitude = latLngValue.lng.toFixed(9);
        this.coordinates = `${this.latitude},${this.longitude}`;
      });
    }

    this.marker.setLatLng(latLng);
    this.marker.bindPopup(this.name || 'Point');
    this.map.setView(latLng, this.map.getZoom() || 13);
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
