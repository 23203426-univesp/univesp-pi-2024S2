import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly username: BehaviorSubject<string | null>;

	constructor() {
		this.username = new BehaviorSubject<string | null>(null);
	}

	public getUsername(): Observable<string | null> {
		return this.username.asObservable();
	}

	public login(username: string) {
		this.username.next(username);
	}
}
