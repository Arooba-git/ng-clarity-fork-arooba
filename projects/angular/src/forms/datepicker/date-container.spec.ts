/*
 * Copyright (c) 2016-2023 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { TestContext } from '../../data/datagrid/helpers.spec';
import { PopoverPosition } from '../../popover/common/popover-positions';
import { ClrPopoverPositions } from '../../utils/popover/enums/positions.enum';
import { ClrPopoverEventsService } from '../../utils/popover/providers/popover-events.service';
import { ClrPopoverPositionService } from '../../utils/popover/providers/popover-position.service';
import { ClrPopoverToggleService } from '../../utils/popover/providers/popover-toggle.service';
import { ClrCommonFormsModule } from '../common/common.module';
import { CONTROL_STATE, IfControlStateService } from '../common/if-control-state/if-control-state.service';
import { ControlClassService } from '../common/providers/control-class.service';
import { ControlIdService } from '../common/providers/control-id.service';
import { FocusService } from '../common/providers/focus.service';
import { ClrFormLayout, LayoutService } from '../common/providers/layout.service';
import { NgControlService } from '../common/providers/ng-control.service';
import { ClrDateContainer } from './date-container';
import { DayModel } from './model/day.model';
import { DateFormControlService } from './providers/date-form-control.service';
import { DateIOService } from './providers/date-io.service';
import { DateNavigationService } from './providers/date-navigation.service';
import { DatepickerEnabledService } from './providers/datepicker-enabled.service';
import { MockDatepickerEnabledService } from './providers/datepicker-enabled.service.mock';
import { LocaleHelperService } from './providers/locale-helper.service';
import { ViewManagerService } from './providers/view-manager.service';

const DATEPICKER_PROVIDERS: any[] = [
  ClrPopoverToggleService,
  DateNavigationService,
  ViewManagerService,
  LocaleHelperService,
  ControlClassService,
  IfControlStateService,
  LayoutService,
  NgControlService,
  DateIOService,
  ControlIdService,
  DateFormControlService,
];

export default function () {
  describe('Date Container Component', () => {
    let context: TestContext<ClrDateContainer, TestComponent>;
    let enabledService: MockDatepickerEnabledService;
    let dateFormControlService: DateFormControlService;
    let dateNavigationService: DateNavigationService;
    let toggleService: ClrPopoverToggleService;
    let container: any;

    beforeEach(function () {
      TestBed.configureTestingModule({
        imports: [FormsModule, ClrCommonFormsModule],
      });
      TestBed.overrideComponent(ClrDateContainer, {
        set: {
          providers: [{ provide: DatepickerEnabledService, useClass: MockDatepickerEnabledService }],
        },
      });

      context = this.create(ClrDateContainer, TestComponent, DATEPICKER_PROVIDERS);

      enabledService = context.getClarityProvider(DatepickerEnabledService) as MockDatepickerEnabledService;
      dateFormControlService = context.getClarityProvider(DateFormControlService);
      toggleService = context.getClarityProvider(ClrPopoverToggleService);
      dateNavigationService = context.getClarityProvider(DateNavigationService);
      container = context.clarityDirective;
    });

    // @deprecated these tests refer to the old forms layout only and can be removed when its removed
    describe('View Basics', () => {
      beforeEach(() => {
        context.detectChanges();
      });

      afterEach(() => {
        // Close the popover to clear the DOM
        const viewManager = document.querySelector('clr-datepicker-view-manager');
        if (viewManager) {
          viewManager.remove();
        }
      });

      it('should returns focus to calendar when we close it', () => {
        const actionButton: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');
        actionButton.click();
        context.detectChanges();
        actionButton.click();
        context.detectChanges();
        expect(document.activeElement).toEqual(actionButton);
      });

      it('should not call focus when date-picker is not visible', () => {
        const actionButton: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');
        const actionButtonSpy = spyOn(actionButton, 'focus');
        const event = new KeyboardEvent('keyup', {
          key: 'Escape',
        });
        document.body.dispatchEvent(event);
        context.detectChanges();
        expect(actionButtonSpy.calls.count()).toBe(0);
      });

      it('applies the clr-form-control class', () => {
        expect(context.clarityElement.className).toContain('clr-form-control');
      });

      it('renders the datepicker toggle button based on the enabled service', () => {
        expect(enabledService.isEnabled).toBe(true);
        expect(context.clarityElement.querySelector('.clr-input-group-icon-action')).not.toBeNull();

        enabledService.fakeIsEnabled = false;
        context.detectChanges();

        expect(context.clarityElement.querySelector('.clr-input-group-icon-action')).toBeNull();
      });

      it('clicking on the button toggles the datepicker popover', () => {
        const button: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');

        button.click();
        context.detectChanges();

        expect(context.clarityDirective.open).toEqual(true);
      });

      it('projects the date input', () => {
        context.detectChanges();
        expect(context.clarityElement.querySelector('input')).not.toBeNull();
      });

      it('shows the datepicker view manager when icon button is clicked', () => {
        expect(document.querySelector('clr-datepicker-view-manager')).toBeNull();

        const button: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');
        button.click();
        context.detectChanges();
        expect(document.querySelector('clr-datepicker-view-manager')).not.toBeNull();
      });

      it('tracks the disabled state', async(() => {
        expect(context.clarityElement.className).not.toContain('clr-form-control-disabled');
        context.testComponent.disabled = true;
        context.detectChanges();
        // Have to wait for the whole control to settle or it doesn't track
        context.fixture.whenStable().then(() => {
          context.detectChanges();
          expect(context.clarityElement.className).toContain('clr-form-control-disabled');
        });
      }));

      it('should set disabled state when dateFormControlService.disabled is true', () => {
        dateFormControlService.disabled = true;
        context.detectChanges();
        expect(context.clarityElement.className).toContain('clr-form-control-disabled');
      });

      it('has an accessible title and aria-label on the calendar toggle button', async () => {
        const toggleButton: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');
        expect(toggleButton.title).toEqual('Choose date');
        expect(toggleButton.attributes['aria-label'].value).toEqual('Choose date');

        dateNavigationService.notifySelectedDayChanged(new DayModel(2022, 1, 1));
        context.detectChanges();
        await context.fixture.whenStable();

        expect(toggleButton.title).toEqual('Change date, 02/01/2022');
        expect(toggleButton.attributes['aria-label'].value).toEqual('Change date, 02/01/2022');
      });

      it('supports clrPosition option', () => {
        context.testComponent.position = 'top-left';
        context.detectChanges();
        expect(context.clarityDirective.popoverPosition).toEqual(ClrPopoverPositions['top-left']);
      });

      it('should add/remove success icon and text', () => {
        /* valid */
        container.state = CONTROL_STATE.VALID;
        context.detectChanges();
        expect(context.clarityElement.querySelector('clr-control-success')).toBeTruthy();
        expect(context.clarityElement.querySelector('cds-icon[shape=check-circle]')).toBeTruthy();

        /* invalid */
        container.state = CONTROL_STATE.INVALID;
        context.detectChanges();
        expect(context.clarityElement.querySelector('clr-control-success')).toBeNull();
        expect(context.clarityElement.querySelector('cds-icon[shape=check-circle]')).toBeNull();
      });
    });

    describe('Typescript API', () => {
      it('marks the date control as touched when the datepicker popover is toggled', () => {
        spyOn(dateFormControlService, 'markAsTouched');
        toggleService.open = true;
        expect(dateFormControlService.markAsTouched).toHaveBeenCalled();
      });

      it('returns the classes to apply to the control', () => {
        expect(context.clarityDirective.controlClass()).toContain('clr-col-md-10');
        expect(context.clarityDirective.controlClass()).toContain('clr-col-12');
        expect(context.clarityDirective.controlClass()).not.toContain('clr-error');
        container.state = CONTROL_STATE.INVALID;
        expect(context.clarityDirective.controlClass()).toContain('clr-error');
        const controlClassService = context.getClarityProvider(ControlClassService);
        const layoutService = context.getClarityProvider(LayoutService);
        layoutService.layout = ClrFormLayout.VERTICAL;
        container.state = CONTROL_STATE.VALID;
        expect(context.clarityDirective.controlClass()).not.toContain('clr-error');
        expect(context.clarityDirective.controlClass()).not.toContain('clr-col-md-10');
        controlClassService.className = 'clr-col-2';
        expect(context.clarityDirective.controlClass()).not.toContain('clr-col-md-10');
        expect(context.clarityDirective.controlClass()).toContain('clr-success');
      });
    });
  });
}

@Component({
  template: `
    <clr-date-container [clrPosition]="position">
      <input type="date" clrDate [(ngModel)]="model" [disabled]="disabled" />
      <clr-control-success>Valid</clr-control-success>
    </clr-date-container>
  `,
  providers: [ClrPopoverEventsService, ClrPopoverPositionService, FocusService],
})
class TestComponent {
  model = '';
  disabled = false;
  position: PopoverPosition;
}
