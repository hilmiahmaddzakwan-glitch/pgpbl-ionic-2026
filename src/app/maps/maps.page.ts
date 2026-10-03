import { Component, OnInit, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { DataService } from '../data.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {
  map!: L.Map;
  private pointMarkers: L.LayerGroup = L.layerGroup();
  private markersByKey = new Map<string, L.Marker>();
  private pointsLoadId = 0;
  private dataService = inject(DataService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  ngOnInit() {
    this.loadMap();
  }

  ionViewWillEnter() {
    if (this.map) {
      this.loadPoints();
    }
  }

  loadMap() {
    if (this.map) {
      return;
    }

    setTimeout(() => {
      this.map = L.map('map').setView([-7.7956, 110.3695], 13);

      this.map.on('popupopen', event => {
        const popupElement = event.popup.getElement();
        if (!popupElement) {
          return;
        }

        const editLink = popupElement.querySelector<HTMLAnchorElement>('.edit-link');
        editLink?.addEventListener('click', clickEvent => {
          clickEvent.preventDefault();
          const key = editLink.dataset['key'];
          if (key) {
            void this.router.navigate(['/editpoint', key]);
          }
        });

        const deleteLink = popupElement.querySelector<HTMLAnchorElement>('.delete-link');
        deleteLink?.addEventListener('click', clickEvent => {
          clickEvent.preventDefault();
          const key = deleteLink.dataset['key'];
          if (key) {
            void this.deletePoint(key);
          }
        });
      });

      const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      );

      const esri = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'ESRI',
        },
      );

      const baseMaps = {
        OpenStreetMap: osm,
        'Esri World Imagery': esri,
      };

      osm.addTo(this.map);
      L.control.layers(baseMaps).addTo(this.map);

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

      const centerMarker = L.marker([-7.7956, 110.3695])
        .addTo(this.map)
        .bindPopup('Yogyakarta');

      centerMarker.openPopup();
      this.pointMarkers.addTo(this.map);
      this.loadPoints();
    }, 0);
  }

  async loadPoints() {
    if (!this.map) {
      return;
    }

    const loadId = ++this.pointsLoadId;
    this.pointMarkers.clearLayers();
    this.markersByKey.clear();

    const points: any = await this.dataService.getPoints();
    if (loadId !== this.pointsLoadId) {
      return;
    }

    if (!points) {
      return;
    }

    for (const key in points) {
      if (Object.prototype.hasOwnProperty.call(points, key)) {
        const point = points[key];

        if (!point || !point.coordinates) {
          continue;
        }

        const coordinates = point.coordinates
          .split(',')
          .map((value: string) => parseFloat(value));

        if (coordinates.length !== 2 || coordinates.some((value: number) => Number.isNaN(value))) {
          continue;
        }

        const marker = L.marker(coordinates as L.LatLngExpression);
        marker.bindPopup(
          `${point.name || 'Point'}<br><a href="/editpoint/${key}" class="edit-link" data-key="${key}">Edit</a> | <a href="#" class="delete-link" data-key="${key}">Delete</a>`,
        );
        marker.addTo(this.pointMarkers);
        this.markersByKey.set(key, marker);
      }
    }
  }

  async deletePoint(key: string) {
    try {
      await this.dataService.deletePoint(key);
      const marker = this.markersByKey.get(key);
      if (marker) {
        this.pointMarkers.removeLayer(marker);
        this.markersByKey.delete(key);
      }
    } catch (error: any) {
      const alert = await this.alertCtrl.create({
        header: 'Delete Failed',
        message: error.message,
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}
