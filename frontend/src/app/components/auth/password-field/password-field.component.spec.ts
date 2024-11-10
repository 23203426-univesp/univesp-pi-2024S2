import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordFieldComponent } from './password-field.component';
import { UserService } from '@services/user/user.service';

describe('PasswordFieldComponent', () => {
	let component: PasswordFieldComponent;
	let fixture: ComponentFixture<PasswordFieldComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [
				{
					provide: UserService,
					useValue: {},
				},
			],
		})
			.compileComponents();

		fixture = TestBed.createComponent(PasswordFieldComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
