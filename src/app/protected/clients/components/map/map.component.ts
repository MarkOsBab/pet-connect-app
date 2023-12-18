import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { faExclamationCircle, faLocationPin } from '@fortawesome/free-solid-svg-icons';
import * as L from 'leaflet';
import { Client } from '../../interfaces/client.interface';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  faExclamationCircle = faExclamationCircle;
  faLocationPin = faLocationPin;
  unknowError: boolean = false;
  errorMessage!: string;
  @Input() clients!: Client[];

  @ViewChild('clientMapContainer', { static: true }) clientMapContainer!: ElementRef;
  map!: L.Map;

  ngAfterViewInit(): void {
    const mapElement = this.clientMapContainer.nativeElement;
    this.map = L.map(mapElement, { zoomControl: false }).setView([-34.7011, -56.1915], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Itera sobre todas las centrales y sucursales y agrega marcadores para cada una
    this.clients.forEach(client => {
      // Marcador para la central
      this.addMarker(client.central_address, client.name, '');

      // Marcadores para las sucursales
      if(client.branches.length > 0) {
        client.branches.forEach(branch => {
          this.addMarker(branch.address, branch.contact_firstname, 'Sucursal');
        });
      }
    });
  }

  private addMarker(address: string, title: string, type: string): void {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const location = L.latLng(lat, lon);

          const size = L.divIcon({
            className: 'custom-icon',
            html: `
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.2721 10.2721C16.2721 12.4813 14.4813 14.2721 12.2721 14.2721C10.063 14.2721 8.27214 12.4813 8.27214 10.2721C8.27214 8.06298 10.063 6.27212 12.2721 6.27212C14.4813 6.27212 16.2721 8.06298 16.2721 10.2721ZM14.2721 10.2721C14.2721 11.3767 13.3767 12.2721 12.2721 12.2721C11.1676 12.2721 10.2721 11.3767 10.2721 10.2721C10.2721 9.16755 11.1676 8.27212 12.2721 8.27212C13.3767 8.27212 14.2721 9.16755 14.2721 10.2721Z"
                fill="black"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.79417 16.5183C2.19424 13.0909 2.05438 7.39409 5.48178 3.79417C8.90918 0.194243 14.6059 0.054383 18.2059 3.48178C21.8058 6.90918 21.9457 12.6059 18.5183 16.2059L12.3124 22.7241L5.79417 16.5183ZM17.0698 14.8268L12.243 19.8965L7.17324 15.0698C4.3733 12.404 4.26452 7.97318 6.93028 5.17324C9.59603 2.3733 14.0268 2.26452 16.8268 4.93028C19.6267 7.59603 19.7355 12.0268 17.0698 14.8268Z"
                fill="black"
              />
            </svg>`
          });

          const marker = L.marker(location, {
            draggable: true,
            keyboard: true,
            icon: size
          }).addTo(this.map);

          const popupContent = `<p>${title}</p><p>${address}</p>`;

          marker.bindPopup(popupContent);

          marker.on('click', function () {
            marker.openPopup();
          });

          marker.bindTooltip(`${title}`, {
            direction: 'top',
            permanent: false,
            className: 'custom-tooltip',
          });

          marker.on('mouseover', function () {
            marker.openTooltip();
          });

          marker.on('mouseout', function () {
            marker.closeTooltip();
          });

        }
      })
      .catch(error => {
        console.error('Ocurrió un error al obtener el mapa.', error);
      });
  }
}
