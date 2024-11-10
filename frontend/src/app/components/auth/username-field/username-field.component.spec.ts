import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernameFieldComponent } from './username-field.component';
import { UserService } from '@services/user/user.service';

describe('UsernameFieldComponent', () => {
	let component: UsernameFieldComponent;
	let fixture: ComponentFixture<UsernameFieldComponent>;

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

		fixture = TestBed.createComponent(UsernameFieldComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
