/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Photo Gallery Controller (Area wise, Month wise filtering, Lightbox modal view)
 */

import { dataService } from '../services/dataService.js';
import { PLANT_AREAS } from '../config/constants.js';
import { ModalComponent } from '../components/modals.js';

export class GalleryController {
    constructor(app) {
        this.app = app;
        this.filterArea = 'all';
    }

    async render() {
        const inspections = await dataService.getAll('inspections', { fy: this.app.state.fy });
        const photos = inspections
            .filter(i => i.photo && i.photo.trim() !== '')
            .map(i => ({
                url: i.photo,
                title: `${i.category.replace('_', ' ')} (${i.id})`,
                area: i.area,
                date: i.date,
                remarks: i.remarks
            }));

        let filteredPhotos = photos;
        if (this.filterArea !== 'all') {
            filteredPhotos = filteredPhotos.filter(p => p.area === this.filterArea);
        }

        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-images me-2"></i>Plant Safety Photo Repository</h3>
                    <div class="text-muted" style="font-size:12px;">Visual evidence and site inspection records across Main Plant, CHP, and Switchyard</div>
                </div>
            </div>

            <!-- Area Filtering -->
            <div class="filter-bar">
                <span class="fw-bold text-primary me-2"><i class="fas fa-filter me-1"></i> Filter Area:</span>
                <button class="btn btn-sm ${this.filterArea === 'all' ? 'btn-erp-primary' : 'btn-erp-outline'}" onclick="app.getController('gallery').filterGallery('all')">All Areas (${photos.length})</button>
                ${PLANT_AREAS.map(a => `
                    <button class="btn btn-sm ${this.filterArea === a.name ? 'btn-erp-primary' : 'btn-erp-outline'}" onclick="app.getController('gallery').filterGallery('${a.name}')">${a.name}</button>
                `).join('')}
            </div>

            <!-- Gallery Grid -->
            <div class="gallery-grid">
                ${filteredPhotos.length > 0 ? filteredPhotos.map((p, index) => `
                    <div class="gallery-card" onclick="app.getController('gallery').openLightbox('${encodeURIComponent(p.url)}', '${encodeURIComponent(p.title)} - ${encodeURIComponent(p.remarks)}')">
                        <img src="${p.url}" class="gallery-thumb" alt="${p.title}">
                        <div class="gallery-caption">
                            <div class="fw-bold text-primary text-truncate">${p.title}</div>
                            <div class="d-flex justify-content-between text-muted mt-1" style="font-size:10.5px;">
                                <span><i class="fas fa-industry me-1"></i>${p.area}</span>
                                <span>${p.date}</span>
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="col-12 text-center py-5 text-muted w-100">
                        <i class="fas fa-camera fs-1 mb-2 text-secondary"></i>
                        <div>No inspection photos found matching current area filter.</div>
                    </div>
                `}
            </div>

            <!-- Lightbox Container -->
            <div id="galleryLightboxContainer"></div>
        `;
    }

    filterGallery(area) {
        this.filterArea = area;
        this.app.renderCurrentModule();
    }

    openLightbox(encodedUrl, encodedCaption) {
        const url = decodeURIComponent(encodedUrl);
        const caption = decodeURIComponent(encodedCaption);
        
        const cont = document.getElementById('galleryLightboxContainer');
        cont.innerHTML = ModalComponent.getLightboxModalHTML();
        
        document.getElementById('lightboxImage').src = url;
        document.getElementById('lightboxCaption').innerHTML = `<strong class="text-warning">Site Photo Record:</strong> ${caption}`;
        
        const modalEl = new bootstrap.Modal(document.getElementById('lightboxModal'));
        modalEl.show();
    }
}
