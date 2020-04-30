
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\TodoHeader.svelte generated by Svelte v3.21.0 */

    const file = "src\\components\\TodoHeader.svelte";

    function create_fragment(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Todo.svelte";
    			add_location(h1, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoHeader> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TodoHeader", $$slots, []);
    	return [];
    }

    class TodoHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoHeader",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let todoItem = [];
    (function getTodoList(){
        const arr = [];
        if(localStorage.length>0){
            for(let i=0;i<localStorage.length;i++){
                arr.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
            }    }    todoItem = arr;
    }());


    function setInputValue(){
        const { subscribe, set } = writable('');
        return {
            subscribe,
            keyup: value => set(value),
        }
    }

    function setTodoList(){
        const { subscribe, update } = writable(todoItem);
        return {
            subscribe,
            insert(value){
                localStorage.setItem(value.inputValue, JSON.stringify(value));
                update(() => {
                    todoItem.push(value);
                    return todoItem;
                });
            },
        }
    }

    function clearTodoList(){
        const { subscribe } = writable('');
        return {
            subscribe,
            clear(){
                console.log("CLEAR");
                
                localStorage.clear();
                todoItem = [];
            }
        }
    }



    const setValue = setInputValue();
    const setTodo = setTodoList();
    const clearTodo = clearTodoList();

    /* src\components\TodoInput.svelte generated by Svelte v3.21.0 */
    const file$1 = "src\\components\\TodoInput.svelte";

    function create_fragment$1(ctx) {
    	let input;
    	let t0;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "ADD";
    			attr_dev(input, "type", "text");
    			input.value = /*$setValue*/ ctx[0];
    			input.autofocus = true;
    			add_location(input, file$1, 34, 0, 739);
    			add_location(button, file$1, 35, 0, 811);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			input.focus();
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "keyup", /*handleKeyup*/ ctx[2], false, false, false),
    				listen_dev(button, "click", /*handleInsert*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$setValue*/ 1 && input.value !== /*$setValue*/ ctx[0]) {
    				prop_dev(input, "value", /*$setValue*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $setValue;
    	validate_store(setValue, "setValue");
    	component_subscribe($$self, setValue, $$value => $$invalidate(0, $setValue = $$value));

    	function handleInsert() {
    		if ($setValue) {
    			const todoObj = { inputValue: $setValue, complete: false };
    			setTodo.insert(todoObj);
    			setValue.keyup("");
    		} else {
    			alert("Please enter the todo!");
    		}

    		
    	}

    	function handleKeyup(e) {
    		setValue.keyup(e.target.value);

    		if (e.keyCode === 13) {
    			handleInsert();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoInput> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TodoInput", $$slots, []);

    	$$self.$capture_state = () => ({
    		setValue,
    		setTodo,
    		handleInsert,
    		handleKeyup,
    		$setValue
    	});

    	return [$setValue, handleInsert, handleKeyup];
    }

    class TodoInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoInput",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\components\TodoList.svelte generated by Svelte v3.21.0 */
    const file$2 = "src\\components\\TodoList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i].inputValue;
    	child_ctx[2] = list[i].complete;
    	return child_ctx;
    }

    // (14:0) {#each $setTodo as {inputValue, complete}}
    function create_each_block(ctx) {
    	let p;
    	let i0;
    	let i0_class_value;
    	let t0;
    	let t1_value = /*inputValue*/ ctx[1] + "";
    	let t1;
    	let t2;
    	let i1;
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			i0 = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			attr_dev(i0, "class", i0_class_value = "fas fa-check " + (/*complete*/ ctx[2] === true ? "finish" : "not") + " svelte-101rxxs");
    			add_location(i0, file$2, 15, 8, 225);
    			attr_dev(i1, "class", "fas fa-trash-alt");
    			add_location(i1, file$2, 17, 8, 323);
    			add_location(p, file$2, 14, 4, 212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, i0);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, i1);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$setTodo*/ 1 && i0_class_value !== (i0_class_value = "fas fa-check " + (/*complete*/ ctx[2] === true ? "finish" : "not") + " svelte-101rxxs")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (dirty & /*$setTodo*/ 1 && t1_value !== (t1_value = /*inputValue*/ ctx[1] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(14:0) {#each $setTodo as {inputValue, complete}}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*$setTodo*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$setTodo*/ 1) {
    				each_value = /*$setTodo*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $setTodo;
    	validate_store(setTodo, "setTodo");
    	component_subscribe($$self, setTodo, $$value => $$invalidate(0, $setTodo = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TodoList", $$slots, []);
    	$$self.$capture_state = () => ({ setTodo, $setTodo });
    	return [$setTodo];
    }

    class TodoList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoList",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\TodoFooter.svelte generated by Svelte v3.21.0 */

    const { console: console_1 } = globals;
    const file$3 = "src\\components\\TodoFooter.svelte";

    function create_fragment$3(ctx) {
    	let br;
    	let t0;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			br = element("br");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Clear Item";
    			add_location(br, file$3, 8, 0, 145);
    			add_location(button, file$3, 9, 0, 151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", clearItem, false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function clearItem() {
    	clearTodo.clear();
    }

    function instance$3($$self, $$props, $$invalidate) {
    	console.log("@@@", clearTodo);
    	
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<TodoFooter> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TodoFooter", $$slots, []);
    	$$self.$capture_state = () => ({ clearTodo, clearItem });
    	return [];
    }

    class TodoFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoFooter",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.21.0 */
    const file$4 = "src\\App.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	const todoheader = new TodoHeader({ $$inline: true });
    	const todoinput = new TodoInput({ $$inline: true });
    	const todolist = new TodoList({ $$inline: true });
    	const todofooter = new TodoFooter({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(todoheader.$$.fragment);
    			t0 = space();
    			create_component(todoinput.$$.fragment);
    			t1 = space();
    			create_component(todolist.$$.fragment);
    			t2 = space();
    			create_component(todofooter.$$.fragment);
    			attr_dev(main, "class", "svelte-n5dhyc");
    			add_location(main, file$4, 7, 0, 246);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(todoheader, main, null);
    			append_dev(main, t0);
    			mount_component(todoinput, main, null);
    			append_dev(main, t1);
    			mount_component(todolist, main, null);
    			append_dev(main, t2);
    			mount_component(todofooter, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todoheader.$$.fragment, local);
    			transition_in(todoinput.$$.fragment, local);
    			transition_in(todolist.$$.fragment, local);
    			transition_in(todofooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todoheader.$$.fragment, local);
    			transition_out(todoinput.$$.fragment, local);
    			transition_out(todolist.$$.fragment, local);
    			transition_out(todofooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(todoheader);
    			destroy_component(todoinput);
    			destroy_component(todolist);
    			destroy_component(todofooter);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		TodoHeader,
    		TodoInput,
    		TodoList,
    		TodoFooter
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
