((LitElement) => {
    const html = LitElement.prototype.html;
    const css = LitElement.prototype.css;

    class LovelaceMultilineTextInput extends LitElement {

        static get properties() {
            return {
                _hass: {},
                _config: {},
                stateObj: {},
                state: {}
            }
        }

        static get styles() {
            return css`
                .flex {
                    display: flex;
                    align-items: center;
                    justify-content: space-evenly;
                }
                .button {
                    cursor: pointer;
                    color: var(--paper-item-icon-color);
                    margin-left: 2px;
                }
                .textarea {
                    background: inherit;
                    border: inherit;
                    border: 1px solid var(--primary-color);
                    box-shadow: none;
                    color: inherit;
                    font: inherit;
                    font-size: 16px;
                    height: auto;
                    letter-spacing: inherit;
                    line-height: inherit;
                    outline: none;
                    padding-left: 5px;
                    padding-bottom: 5px;
                    min-height: 80px;
                    overflow-y: auto;
                    word-wrap: break-word;
                    width: 98%;
                    word-spacing: inherit;
                }
                .text-bold {
                    font-weight: bold;
                }
                .text-italic {
                    font-style: italic;
                }
                .text-left {
                    float: left;
                }
                .text-red {
                    color: red;
                }
                .text-right {
                    float: right;
                }
                .text-small {
                    font-size: 11px;
                    color: var(--secondary-text-color);
                }
                .hidden {
                    display: none;
                }
                .button-disabled {
                    cursor: auto;
                    pointer-events: none;
                }
                .card-content {
                    padding-bottom: 40px;
                }
                .card-help {
                    color: var(--secondary-text-color);
                    margin-left: -20px;
                    font-size: 11px;
                }
            `;
        }

        updated() {
            let _this = this;
            this.updateComplete.then(() => {
                let new_state = _this.getState();
                // only overwrite if state has changed since last overwrite
                if(_this.state.last_updated_text === null || new_state !== _this.state.last_updated_text) {
                    _this.setText(new_state, true);
                }
            });
        }

        render() {
            return html`
                <ha-card .hass="${this._hass}" .config="${this._config}" class="background">
                    ${this.state.title ? html`<div class="card-header">${this.state.title}</div>` : null}
                    <div class="card-content">
                        <div class="card-help hidden">
                            <ul>
                                <li>yyyymmdd#휴일명 또는 mmdd#휴일명 형태로 입력가능합니다.</li>
                                <li>#휴일명은 생략 가능합니다.</li>
                                <li>한 줄에 날짜 하나씩 입력하세요.</li>
                                <li>수정 후 저장 버튼을 누르면 바로 반영됩니다.</li>
                                <li>상세 설명은 <a href="https://github.com/GrecHouse/korean_workday" target="_blank">여기</a> 에서 확인하세요.</li>
                            </ul>
                            <span class="text-help"></span>
                        </div>
                        <textarea maxlength="${this.state.max_length !== -1 ? this.state.max_length : ""}" @keyup="${() => this.onKeyupTextarea()}" class="textarea" placeholder="${this.state.placeholder_text}">${this.getState()}</textarea>
                        <span class="text-red text-small text-italic text-left" id="spanMinCharactersInfoText"></span>
                        <span class="text-small text-italic text-left" id="spanMaxCharactersInfoText"></span>
                        ${Object.keys(this.state.buttons).map(this.renderButton.bind(this))}
                        <span class="button text-small text-right" title="Help" @tap="${() => this.toggleHelp()}"><ha-icon icon="mdi:help-circle-outline"></ha-icon></span>
                    </div>
                </ha-card>`;
        }

        toggleHelp() {
            let elem = this.shadowRoot.querySelector(".card-help");
            elem.classList.toggle("hidden");
        }
        
        renderButton(key) {
            return this.state.buttons[key]
                ? html`<span class="button text-right" title="${this.state.hints[key]}" id="button-${key}" @tap="${() => { if(this.callAction(key) !== false) { this.callService(key); }}}"><ha-icon icon="${this.state.icons[key]}"></ha-icon></span>`
                : null;
        }
        
        getCardSize() {
            return Math.round(this.scrollHeight / 50);
        }

        getState() {
            const value = this.stateObj ? this.stateObj.state : this.state.default_text;
            return value.replace("\\n", "\n");
        }

        getText() {
            return this.shadowRoot.querySelector(".textarea").value;
        }

        setText(val, entity_update) {
            if(entity_update === true) {
                this.state.last_updated_text = val;
            }
            this.shadowRoot.querySelector(".textarea").value = val;
            this.resizeTextarea();
            this.updateCharactersInfoText();
        }

        clearText() {
            clearTimeout(this.state.autosave_timeout);
            this.setText('');
        }

        pasteText() {
            clearTimeout(this.state.autosave_timeout);
            let elem = this.shadowRoot.querySelector(".textarea");
            if(elem) {
                elem.focus();
                let val = elem.value;
                if(typeof navigator.clipboard.readText === "function") {
                    navigator.clipboard.readText().then((text) => { this.setText(val + text); }, (err) => { console.error("Error on paste: ", err); });
                }
                else {
                    console.warn("Sorry, your browser does not support the clipboard paste function.");
                }
            }
        }

        onKeyupTextarea() {
            if(this.state.autosave) {
                clearTimeout(this.state.autosave_timeout);
                let _this = this;
                this.state.autosave_timeout = setTimeout(function() {
                    if(_this.callAction('save') !== false) {
                        _this.callService('save');
                    }
                }, 1000);
            }
            this.updateCharactersInfoText();
            this.resizeTextarea();
        }

        updateCharactersInfoText() {
            let textLength = this.shadowRoot.querySelector(".textarea").value.length;
            let button_save = this.shadowRoot.querySelector("#button-save");
            let disable_button = false;

            if(this.state.max_length !== false) {
                let maxCharactersInfoText = `${textLength}/${this.state.max_length} max.`;
                let maxCharactersElem = this.shadowRoot.querySelector("#spanMaxCharactersInfoText")
                maxCharactersElem.innerHTML = maxCharactersInfoText;

                if(textLength >= this.state.max_length) {
                    maxCharactersElem.classList.add("text-red");
                    disable_button = true;
                }
                else {
                    maxCharactersElem.classList.remove("text-red");
                }
                if(textLength <= this.state.max_length) {
                    disable_button = false;
                }
            }

            if(this.state.min_length > 0) {
                let minCharactersInfoText = `${textLength}/${this.state.min_length} min.`;
                let minCharactersElem = this.shadowRoot.querySelector("#spanMinCharactersInfoText")
                minCharactersElem.innerHTML = minCharactersInfoText;

                if(textLength < this.state.min_length) {
                    minCharactersElem.classList.remove("hidden");
                    disable_button = true;
                }
                else {
                    minCharactersElem.classList.add("hidden");
                }
            }

            if(button_save) {
                if(disable_button) {
                    button_save.classList.add("button-disabled");
                    button_save.classList.add("text-red");
                }
                else {
                    button_save.classList.remove("button-disabled");
                    button_save.classList.remove("text-red");
                }
            }
        }

        resizeTextarea() {
            let textArea = this.shadowRoot.querySelector('.textarea');
            let textAreaComputedStyle = getComputedStyle(textArea);
            textArea.style.height = "auto";
            textArea.style.overflowY = "auto";
            textArea.style.height = (parseFloat(textArea.scrollHeight) + parseFloat(textAreaComputedStyle.paddingBottom) + parseFloat(textAreaComputedStyle.borderBottomWidth)) + "px";
            textArea.style.overflowY = "hidden";
        }

        callAction(action) {
            if (typeof this.state.actions[action] === 'function') {
                return this.state.actions[action]();
            }
        }

        callService(service) {
            if(this.state.entity_type === 'input_text' || this.state.entity_type === 'var') {
                let value = (typeof this.state.service_values[service] === 'function' ? this.state.service_values[service]() : this.state.service_values[service]);
                if(this.state.service[service]) {
                    this._hass.callService(this.state.entity_type, this.state.service[service], {entity_id: this.stateObj.entity_id, value: value});
                }
            }
        }

        actionSave() {
            let len = this.getText().length;
            let length_check = len >= this.state.min_length && (this.state.max_length === false || len <= this.state.max_length);
            return length_check;
        }

        actionClear() {
            this.clearText();
            if(this.state.save_on_clear && this.callAction('save') !== false) {
                this.callService('save');
            }
        }

        actionPaste() {
            this.pasteText();
        }

        setConfig(config) {
            const supported_entity_types = [
                'input_text',
                'var',      // custom component: https://community.home-assistant.io/t/custom-component-generic-variable-entities/128627
            ];

            const actions = {
                save: () => { return this.actionSave(); },
                paste: () => { return this.actionPaste(); },
                clear: () => { return this.actionClear(); },
            };

            // paste has no service, clear must be "confirmed" by saving
            const services = {
                'input_text': {
                    save: 'set_value',
                },
                'var': {
                    save: 'set',
                },
            };

            const service_values = {
                save: () => { return this.getText(); },
                paste: null,
                clear: '',
            };

            const buttons = {
                save: true,
                paste: false,
                clear: false,
            };

            const icons = {
                save: 'mdi:content-save-outline',
                paste: 'mdi:content-paste',
                clear: 'mdi:trash-can-outline',
            };

            const hints = {
                save: 'Save',
                paste: 'Paste from clipboard',
                clear: 'Clear text'
            };

            let entity_type = config.entity.split('.')[0];
            if (!config.entity || !supported_entity_types.includes(entity_type)) {
                throw new Error('Please define an entity of type: ' + supported_entity_types.join(', '));
            }

            this.state = {
                autosave: config.autosave === true,
                entity: config.entity,
                max_length: parseInt(config.max_length) || false,
                min_length: parseInt(config.min_length) || 0,
                placeholder_text: config.placeholder_text || "",
                save_on_clear: config.save_on_clear === true,
                title: config.title,

                autosave_timeout: null,
                default_text: "",
                entity_type: entity_type,
                last_updated_text: null,
                showButtons: config.buttons !== false,

                actions: Object.assign({}, actions),
                buttons: Object.assign({}, buttons, config.buttons),
                hints: Object.assign({}, hints),
                icons: Object.assign({}, icons, config.icons),
                service: Object.assign({}, services[entity_type]),
                service_values: Object.assign({}, service_values),
            };

            this.state.min_length = Math.max(this.state.min_length, 0);

            if(this.state.max_length !== false && this.state.max_length <= 0) {
                throw new Error("The max length should be greater than zero.");
            }
            if(this.state.min_length > this.state.max_length && this.state.max_length !== false) {
                throw new Error("The min length must not be greater than max length.");
            }

            this._config = config;
        }

        set hass(hass) {
            this._hass = hass;

            if(hass && this._config) {
                this.stateObj = this._config.entity in hass.states ? hass.states[this._config.entity] : null;
                if(this.stateObj) {
                    if(this.state.title === undefined) {
                        this.state.title = this.stateObj.attributes.friendly_name || "";
                    }
                    if(this.state.entity_type === "input_text") {
                        if(this.stateObj.attributes.mode !== "text") {
                            throw new Error("An input_text entity must be in 'text' mode!");
                        }
                        if(this.state.min_length === 0 && (this.stateObj.attributes.min || 0) > 0) {
                            this.state.min_length = this.stateObj.attributes.min;
                            console.warn("Entity " + this._config.entity + " requires at least " + this.stateObj.attributes.min + " characters.");
                        }
                        if(this.state.max_length === false || this.stateObj.attributes.max < this.state.max_length) {
                            if(this.state.max_length !== false) {
                                console.warn("Entity " + this._config.entity + " allows less characters (" + this.stateObj.attributes.max + ") than desired.");
                            }
                            this.state.max_length = this.stateObj.attributes.max;
                        }
                    }
                }
            }
        }
    }

    customElements.define('holiday-card', LovelaceMultilineTextInput);
})(window.LitElement || Object.getPrototypeOf(customElements.get("hui-view")));

