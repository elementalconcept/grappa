import { HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { tap } from 'rxjs/operators';

import { TestClientService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  findResponse: any | null = null;
  listResponse: any | null = null;
  querySampleResponse: any | null = null;
  toggleFlagResponse: any | null = null;
  createResponse: any | null = null;
  updateResponse: any | null = null;

  file = new FormControl();
  form = new FormGroup({ file: this.file });
  selectedFiles?: FileList;

  constructor(private readonly client: TestClientService) {
    this.client
      .find(123)
      .pipe(tap(res => console.log('find', res)))
      .subscribe(response => this.findResponse = response);

    this.client
      .list()
      .pipe(tap(res => console.log('list', res)))
      .subscribe(response => this.listResponse = response);

    this.client
      .querySample({ abc: 'xyz', test: true })
      .pipe(tap(res => console.log('querySample', res)))
      .subscribe(response => this.querySampleResponse = response);

    this.client
      .toggleFlag(123)
      .pipe(tap(res => console.log('toggleFlag', res)))
      .subscribe(response => this.toggleFlagResponse = response);

    this.client
      .create(123)
      .pipe(tap(res => console.log('create', res)))
      .subscribe(response => this.createResponse = response);

    this.client
      .update(123, { x: 'a' })
      .pipe(tap(res => console.log('update', res)))
      .subscribe(response => this.updateResponse = response);
  }

  onFileUpload = () => {
    if (this.selectedFiles === undefined || this.selectedFiles.length === 0) {
      console.log('No files selected');
      return;
    }

    const formData = new FormData();

    Array.from(this.selectedFiles).forEach(f => formData.append('file', f));

    this.client
      .upload(formData)
      .subscribe({
        next: r => {
          switch (r.type) {
            case HttpEventType.UploadProgress:
              console.log(`Upload progress: ${ r.total === undefined ? '100' : (r.loaded / r.total * 100).toFixed(0) }%`);
              break;

            case HttpEventType.DownloadProgress:
              console.log(`Download progress: ${ r.total === undefined ? '100' : (r.loaded / r.total * 100).toFixed(0) }%`);
              break;

            case HttpEventType.Response:
              console.log('Upload response', r.body);
              break;
          }
        },
        error: e => console.log('Upload error', e),
        complete: () => console.log('Upload complete')
      });
  };

  onFileSelect = (event: Event) => this.selectedFiles = (event.target as HTMLInputElement).files;
}
