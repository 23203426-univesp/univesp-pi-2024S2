import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CryptoService } from './services/crypto/crypto.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, FormsModule, CommonModule],
	templateUrl: './app.component.html',
	styleUrl: './app.component.sass',
})
export class AppComponent implements OnInit {
	constructor(private cryptoService: CryptoService) { }

	username: string = '';
	isUsernameValid: boolean = false;

	ngOnInit(): void {
	}

	validateUsername(): void {
		this.isUsernameValid = /[A-Za-z0-9_]{4,16}/.test(this.username);
	}
}
