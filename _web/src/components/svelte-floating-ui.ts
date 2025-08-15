/*
 * svelte-floating-ui
 * Fork of https://github.com/fedorovvvv/svelte-floating-ui
 */

import type {
  ComputePositionReturn,
  FloatingElement,
  ReferenceElement,
  VirtualElement,
} from "@floating-ui/core";

import type {
  AutoUpdateOptions,
  ComputePositionConfig,
} from "@floating-ui/dom";

import { autoUpdate as _autoUpdate, computePosition } from "@floating-ui/dom";
import { onDestroy, tick } from "svelte";
import type { Readable, Writable } from "svelte/store";

type ComputeConfig = Partial<ComputePositionConfig> & {
  onComputed?: (computed: ComputePositionReturn) => void;
  /**
   * false: Don't initialize autoUpdate;
   * true: Standard autoUpdate values from the documentation;
   * object: All as in the autoUpdate documentation. Your parameters are added to the default ones;
   * @default true
   */
  autoUpdate?: boolean | Partial<AutoUpdateOptions>;
};

type UpdatePosition = (
  contentOptions?: Omit<ComputeConfig, "autoUpdate">,
) => void;

type ReferenceAction = (
  node: HTMLElement | Writable<VirtualElement> | VirtualElement,
) => void;

type ContentAction = (
  node: HTMLElement,
  contentOptions?: ComputeConfig,
) => void;

const createFloatingActions = (
  initOptions?: ComputeConfig,
): [ReferenceAction, ContentAction, UpdatePosition] => {
  let referenceElement: ReferenceElement;
  let floatingElement: FloatingElement;
  const defaultOptions: Partial<ComputeConfig> = {
    autoUpdate: true,
  };
  let options: ComputeConfig | undefined = initOptions;
  const getOptions = (mixin?: object): ComputeConfig => {
    return { ...defaultOptions, ...(initOptions || {}), ...(mixin || {}) };
  };
  const updatePosition: UpdatePosition = (updateOptions) => {
    if (referenceElement && floatingElement) {
      options = getOptions(updateOptions);
      computePosition(referenceElement, floatingElement, options).then((v) => {
        Object.assign(floatingElement.style, {
          position: v.strategy,
          left: `${v.x}px`,
          top: `${v.y}px`,
        });
        options?.onComputed?.(v);
      });
    }
  };
  const referenceAction: ReferenceAction = (node) => {
    if ("subscribe" in node) {
      setupVirtualElementObserver(node);
      return {};
    }
    referenceElement = node;
    updatePosition();
  };
  const contentAction: ContentAction = (node, contentOptions) => {
    let autoUpdateDestroy: ReturnType<typeof _autoUpdate> | undefined;
    floatingElement = node;
    options = getOptions(contentOptions);
    setTimeout(() => updatePosition(contentOptions), 0); //tick doesn't work
    updatePosition(contentOptions);
    const destroyAutoUpdate = () => {
      if (autoUpdateDestroy) {
        autoUpdateDestroy();
        autoUpdateDestroy = undefined;
      }
    };
    const initAutoUpdate = (
      { autoUpdate } = options || {},
    ): typeof autoUpdateDestroy => {
      destroyAutoUpdate();
      if (autoUpdate !== false) {
        tick().then(() => {
          return _autoUpdate(
            referenceElement,
            floatingElement,
            () => updatePosition(options),
            autoUpdate === true ? {} : autoUpdate,
          );
        });
      }
      return;
    };
    autoUpdateDestroy = initAutoUpdate();
    return {
      update(contentOptions: Parameters<typeof contentAction>[1]) {
        updatePosition(contentOptions);
        autoUpdateDestroy = initAutoUpdate(contentOptions);
      },
      destroy() {
        destroyAutoUpdate();
      },
    };
  };
  const setupVirtualElementObserver = (node: Readable<VirtualElement>) => {
    const unsubscribe = node.subscribe(($node) => {
      if (referenceElement === undefined) {
        referenceElement = $node;
        updatePosition();
      } else {
        // Preserve the reference to the virtual element.
        Object.assign(referenceElement, $node);
        updatePosition();
      }
    });
    onDestroy(unsubscribe);
  };
  return [referenceAction, contentAction, updatePosition];
};

export { createFloatingActions };

export type { ComputeConfig, UpdatePosition, ReferenceAction, ContentAction };
