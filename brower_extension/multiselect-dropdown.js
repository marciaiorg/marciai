/*
Adapted from https://github.com/admirhodzic/multiselect-dropdown/
*/

/*
MIT License

Copyright (c) 2021 admirhodzic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function MultiselectDropdown(options) {
  var config = {
    search: true,
    height: '15rem',
    placeholder: 'select',
    txtSelected: 'selected',
    txtAll: 'All',
    txtRemove: 'Remove',
    txtSearch: 'search',
    classPrefix: '',
    optionModifier: (o, op) => {},
    optionSelectedModifier: (o, op) => {},
    selectedTitleModifier: (sels, div) => {},
    ...options,
  };
  function newEl(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs !== undefined)
      Object.keys(attrs).forEach((k) => {
        if (k === 'class') {
          Array.isArray(attrs[k])
            ? attrs[k].forEach((o) => (o !== '' ? e.classList.add(o) : 0))
            : attrs[k] !== ''
            ? e.classList.add(attrs[k])
            : 0;
        } else if (k === 'style') {
          Object.keys(attrs[k]).forEach((ks) => {
            e.style[ks] = attrs[k][ks];
          });
        } else if (k === 'text') {
          attrs[k] === '' ? (e.innerHTML = '&nbsp;') : (e.innerText = attrs[k]);
        } else e[k] = attrs[k];
      });
    return e;
  }

  document.querySelectorAll('select[multiple]').forEach((el, k) => {
    var div = newEl('div', {
      class: config.classPrefix + 'multiselect-dropdown',
      style: {
        width: config.style?.width ?? el.clientWidth + 'px',
        padding: config.style?.padding ?? '',
      },
    });
    el.style.display = 'none';
    el.parentNode.insertBefore(div, el.nextSibling);
    var listWrap = newEl('div', {
      class: config.classPrefix + 'multiselect-dropdown-list-wrapper',
    });
    listWrap.setAttribute('title', '');
    var list = newEl('div', {
      class: config.classPrefix + 'multiselect-dropdown-list',
      style: { height: config.height },
    });
    var search = newEl('input', {
      class: [config.classPrefix + 'multiselect-dropdown-search'].concat([
        config.searchInput?.class ?? 'form-control',
      ]),
      style: {
        width: '100%',
        display:
          el.attributes['multiselect-search']?.value === 'true'
            ? 'block'
            : 'none',
      },
      placeholder: config.txtSearch,
    });
    listWrap.appendChild(search);
    div.appendChild(listWrap);
    listWrap.appendChild(list);

    el.loadOptions = () => {
      list.innerHTML = '';

      if (el.attributes['multiselect-select-all']?.value == 'true') {
        var op = newEl('div', {
          class: config.classPrefix + 'multiselect-dropdown-all-selector',
        });
        var ic = newEl('input', { type: 'checkbox' });
        op.appendChild(ic);
        op.appendChild(newEl('label', { text: config.txtAll }));

        op.addEventListener('click', () => {
          op.classList.toggle(config.classPrefix + 'checked');
          op.querySelector('input').checked =
            !op.querySelector('input').checked;

          var ch = op.querySelector('input').checked;
          list
            .querySelectorAll(
              ':scope > div:not(.' +
                config.classPrefix +
                'multiselect-dropdown-all-selector)'
            )
            .forEach((i) => {
              if (i.style.display !== 'none') {
                i.querySelector('input').checked = ch;
                i.optEl.selected = ch;
              }
            });

          el.dispatchEvent(new Event('change'));
        });
        ic.addEventListener('click', (ev) => {
          ic.checked = !ic.checked;
        });
        el.addEventListener('change', (ev) => {
          let itms = Array.from(
            list.querySelectorAll(
              ':scope > div:not(.' +
                config.classPrefix +
                'multiselect-dropdown-all-selector)'
            )
          ).filter((e) => e.style.display !== 'none');
          let existsNotSelected = itms.find(
            (i) => !i.querySelector('input').checked
          );
          if (ic.checked && existsNotSelected) ic.checked = false;
          else if (ic.checked == false && existsNotSelected === undefined)
            ic.checked = true;
        });

        list.appendChild(op);
      }

      Array.from(el.options).map((o) => {
        var op = newEl('div', {
          class: o.selected ? config.classPrefix + 'checked' : '',
          optEl: o,
        });

        config.optionModifier(o, op);

        var ic = newEl('input', { type: 'checkbox', checked: o.selected });
        op.appendChild(ic);
        op.appendChild(newEl('label', { text: o.text }));

        op.addEventListener('click', () => {
          op.classList.toggle(config.classPrefix + 'checked');
          op.querySelector('input').checked =
            !op.querySelector('input').checked;
          op.optEl.selected = !!!op.optEl.selected;
          el.dispatchEvent(new Event('change'));
        });
        ic.addEventListener('click', (ev) => {
          ic.checked = !ic.checked;
        });
        o.listitemEl = op;
        list.appendChild(op);
      });
      div.listEl = listWrap;

      div.refresh = () => {
        div
          .querySelectorAll(
            'span.' +
              config.classPrefix +
              'optext, span.' +
              config.classPrefix +
              'placeholder'
          )
          .forEach((t) => div.removeChild(t));
        var sels = Array.from(el.selectedOptions);

        config.selectedTitleModifier(sels, div);

        if (
          sels.length > (el.attributes['multiselect-max-items']?.value ?? 5)
        ) {
          div.appendChild(
            newEl('span', {
              class: [
                config.classPrefix + 'optext',
                config.classPrefix + 'maxselected',
              ],
              text: sels.length + ' ' + config.txtSelected,
            })
          );
        } else {
          sels.map((x) => {
            var c = newEl('span', {
              class: config.classPrefix + 'optext',
              text: x.text,
              srcOption: x,
            });

            config.optionSelectedModifier(x, c);

            if (el.attributes['multiselect-hide-x']?.value !== 'true')
              c.appendChild(
                newEl('span', {
                  class: config.classPrefix + 'optdel',
                  text: '🗙',
                  title: config.txtRemove,
                  onclick: (ev) => {
                    c.srcOption.listitemEl.dispatchEvent(new Event('click'));
                    div.refresh();
                    ev.stopPropagation();
                  },
                })
              );

            div.appendChild(c);
          });
        }
        if (0 == el.selectedOptions.length)
          div.appendChild(
            newEl('span', {
              class: config.classPrefix + 'placeholder',
              text: el.attributes['placeholder']?.value ?? config.placeholder,
            })
          );
      };
      div.refresh();
    };
    el.loadOptions();

    search.addEventListener('input', () => {
      list
        .querySelectorAll(
          ':scope div:not(.' +
            config.classPrefix +
            'multiselect-dropdown-all-selector)'
        )
        .forEach((d) => {
          var txt = d.querySelector('label').innerText.toUpperCase();
          d.style.display = txt.includes(search.value.toUpperCase())
            ? 'block'
            : 'none';
        });
    });

    div.addEventListener('click', () => {
      div.listEl.style.display = 'block';
      search.focus();
      search.select();
    });

    document.addEventListener('click', function (event) {
      if (!div.contains(event.target)) {
        listWrap.style.display = 'none';
        div.refresh();
      }
    });
  });
}

export { MultiselectDropdown };
