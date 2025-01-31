import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-room-dialog',
  templateUrl: './room-dialog.component.html',
  styleUrls: ['./room-dialog.component.scss'],
  standalone: true,  // This makes the component standalone
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
})
export class RoomDialogComponent {
  roomForm: FormGroup;  // Declare the form group
  private name: string = '';
  private success: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<RoomDialogComponent>,
    private fb: FormBuilder
  ) {
    this.roomForm = this.fb.group({
      roomName: ['', Validators.required],  
    });

  }

  onSubmit() {    
    if (this.roomForm.valid) {
      this.success = true;
      this.name = this.roomForm.value.roomName;
      this.dialogRef.close({ success: true, name: this.name });
    } else {
      console.log('Form is invalid');
    }
  }

  onClose(): void {
    this.dialogRef.close({ success: false, name: 'Dialog was closed' });
  }
}
