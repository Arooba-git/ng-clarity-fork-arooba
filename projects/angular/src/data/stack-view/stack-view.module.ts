/*
 * Copyright (c) 2016-2023 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { angleIcon, ClarityIcons } from '@cds/core/icon';

import { ClrIconModule } from '../../icon/icon.module';
import { ClrExpandableAnimationModule } from '../../utils/animations/expandable-animation/expandable-animation.module';
import { ClrStackBlock } from './stack-block';
import { ClrStackContentInput } from './stack-content-input';
import { ClrStackHeader } from './stack-header';
import { ClrStackInput } from './stack-input';
import { ClrStackSelect } from './stack-select';
import { ClrStackView } from './stack-view';
import { ClrStackViewCustomTags, ClrStackViewLabel } from './stack-view-custom-tags';

export const CLR_STACK_VIEW_DIRECTIVES: Type<any>[] = [
  ClrStackView,
  ClrStackHeader,
  ClrStackBlock,
  ClrStackContentInput,
  ClrStackViewLabel,
  ClrStackViewCustomTags,
  /**
   * Undocumented experimental feature: inline editing.
   */
  ClrStackInput,
  ClrStackSelect,
  /**
   * End of undocumented experimental feature.
   */
];

@NgModule({
  imports: [CommonModule, FormsModule, ClrIconModule, ClrExpandableAnimationModule],
  declarations: [CLR_STACK_VIEW_DIRECTIVES],
  exports: [CLR_STACK_VIEW_DIRECTIVES],
})
export class ClrStackViewModule {
  constructor() {
    ClarityIcons.addIcons(angleIcon);
  }
}
