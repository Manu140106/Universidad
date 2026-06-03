import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }  from '@angular/common';
@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  @Input() label: string = 'Click';
  @Input() type: 'button' | 'submit' = 'button';

  @Output() btnClick = new EventEmitter<Event>();
}

