import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MATERIAL_MODULES } from '../../shared/shared-material';

export interface ConfirmDialogData { 
  title: string;
  mesage: string;
  confirmText: string;
  confirmColor?: 'warn' | 'primary' | 'accent';
  
  }


@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ CommonModule, ...MATERIAL_MODULES],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {


  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

}
