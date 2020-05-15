import Block from '../blots/block';
import Container from '../blots/container';
import Quill from '../core/quill';
// import BulletContainer from './list-container';
import {Scope} from '../parchment';
import Color from './color';
import Size from './size';

var types = ["circle", "ring", "arrow"],
    b = ["bullet-id"],
    _ = ["color", "size"];

// class BulletContainer extends Container {}
// BulletContainer.blotName = 'list-container';
// BulletContainer.tagName = 'OL';

class BulletItem extends Block {
  static formats(domNode) {
		return domNode.tagName === this.tagName ? void 0 : super.formats(domNode)
  }

  constructor(scroll, domNode) {
    super(scroll, domNode);
  }

	html(index, length) {
		var n = this.domNode.innerHTML
			, r = this.formats()
			, i = ""
			, a = ""
			, s = ""
			, l = ""
			, u = ""
			, c = ""
			, d = ""
			, p = ""
			, h = r.heading;
		if (h)
				switch (isNaN(h) ? i += " ql-heading-" + h + " " : (d = h && !isNaN(h) ? "<h" + h + ">" : "",
				p = h && !isNaN(h) ? "</h" + h + ">" : ""),
				h) {
				case "1":
						a = "font-size: 16pt;";
						break;
				case "2":
						a = "font-size: 14pt;";
						break;
				case "3":
						a = "font-size: 12pt;";
						break;
				case "title":
						a = "font-size: 22pt;";
						break;
				case "subtitle":
						a = "font-size: 18pt;",
						s = "color: #888888;"
				}
		var m = r.linespacing;
		isNaN(m) ? l = "line-height: 1.7;" : (u = u.replace(/line-height: ?\d.*\.\d;/, ""),
		l += "line-height: " + m + "%;"),
		a || (a = "font-size: 11pt;"),
		s || (s = "color: #494949;"),
		u += "margin-bottom: 0pt;margin-top: 0pt;";
		var g = r.align;
		if (g && (c += ' align="' + g + '" ',
		u += "text-align: " + g + ";"),
		u += a + s + l,
		d) {
				var v = a + s + l;
				d = d.replace(/>$/, "") + ' style="' + v + '">'
		}
		if (this.children) {
				var y = [];
				return this.children.forEachAt(e, t, function(e, t, n) {
						if ("function" == typeof e.html)
								y.push(e.html(t, n));
						else if (e instanceof Text)
								y.push((0,
								o.escapeText)(e.value().slice(t, t + n)));
						else {
								var r = (0,
								f.default)(e, t, n);
								r && y.push(r)
						}
				}),
				'<li class="' + i + '" ' + c + ' style="' + u + '">' + d + y.join("") + p + "</li>"
		}
		return '<li class="' + i + '" ' + c + ' style="' + u + ';">' + d + n + p + "</li>"
	}

	formatAt(t, n, r, i) {
		"color" === r && !i && this.formats().color && (i = l.ColorBlockStyle.defaultValue),
		"size" === r && !i && this.formats().size && (i = u.SizeBlockClass.defaultValue),
		super.formatAt(t, n, r, i),
		"color" !== r && "size" !== r || t === this.offset() && n >= this.length() - 1 && this.format("" + r, i)
	}

	format(name, value) {
		if (name !== x.blotName || value)
				"header" === name && (name = "heading"),
				super.format(name, value);
		else if (["1", "2", "3"].indexOf(this.formats().heading) > -1) {
				var r = this.formats().heading;
				this.format("heading", !1),
				this.replaceWith("header", r)
		} else
				this.replaceWith(Quill.create(this.statics.scope))
	}
	formats() {
		var t = super.formats();
		t.color = Color.ColorBlockStyle.value(this.domNode) || void 0;
		t.size = Size.SizeBlockClass.value(this.domNode) || void 0;
		return t;
	}

	remove() {
		null == this.prev && null == this.next ? this.parent.remove() : super.remove()
	}

	formatReplaceWith(t, n) {
		var r, i = this, o = function() {
				return i.parent.isolate(i.offset(i.parent), i.length()),
				i.parent.unwrap(),
				super.replaceWith(t, n)
		};
		if ("ordered" === t || "bullet" === t) {
				var a = this.formats();
				r = o(),
				_.forEach(function(e) {
						a[e] && r.format(e, a[e])
				})
		} else
				r = o(),
				_.forEach(function(e) {
						r.format(e, !1)
				});
		return r
	}
	replaceWith(name, value) {
		var n = this;
		if (this.parent instanceof Bullet) {
				var r = this.parent.statics.formats(this.parent.domNode);
				if (name !== this.parent.statics.blotName && b.forEach(function(e) {
						n.format(e, !1)
				}),
				name === this.parent.statics.blotName && value !== r && "checked" !== value && "unchecked" !== value && "checked" !== r && "unchecked" !== r)
						(function(e) {
								var t = e.formats()["bullet-id"]
									, n = e;
								for (; null != n && "scroll" !== n.statics.blotName; )
										n = n.parent;
								return [].map.call(n.domNode.querySelectorAll('ul > li[data-bullet-id="' + t + '"]'), function(e) {
										return Quill.find(e)
								})
						}
						)(this).forEach(function(n) {
								S(n.parent) !== t && "checked" !== S(n.parent) && "unchecked" !== S(n.parent) && n.formatReplaceWith(name, value)
						});
				else
						this.formatReplaceWith(name, value)
		}
	}
}
BulletItem.blotName = "bullet-item";
BulletItem.tagName = "LI";
BulletItem.className = "bullet-item";

class Bullet extends Container {
	static create(value) {
		var node = super.create();
		node.setAttribute("data-list-style", value);
		return node
	}
	static formats(domNode) {
		if (!domNode.className.match(/list-(code|indent)(\d+)/)) {
			return types.find(function(type) {
				return domNode.getAttribute("data-list-style") === type
			})
		}
	}
	constructor(t) {
		var n;
		n = e.call(this, t) || this;
		var r = function(e) {
				if (3 !== e.which && e.target.parentNode === t) {
						var r = n.statics.formats(t)
							, i = Quill.find(e.target);
						"checked" === r ? i.format("bullet", "unchecked") : "unchecked" === r && i.format("bullet", "checked"),
						!p.default.any || "checked" !== r && "unchecked" !== r || e.preventDefault()
				}
		};
		return p.default.any ? t.addEventListener("touchstart", r) : t.addEventListener("mousedown", r),
		n
	}
	// register = function() {
	// 	a.default.register(w)
	// }
	html(e, t) {
		var n = {
				children: this.children
		};
		return (0,
		f.default)(n, e, t, !0)
	}
	format(name, value) {
		this.children.length > 0 && this.children.tail.format(name, value)
	}
	formats() {
		var e = {};
		return e[this.statics.blotName] = this.statics.formats(this.domNode),
		e
	}
	insertBefore(list, ref) {
		if (list instanceof BulletItem)
				super.insertBefore(list, ref);
		else {
				var r = null == ref ? this.length() : ref.offset(this)
					, i = this.split(r);
				i.parent.insertBefore(list, i)
		}
	}
	formatInlineBlock(e, t) {
		var n = e.delta();
		if (n && n.ops.length > 1) {
				var r = n.ops.slice(0, n.ops.length - 1);
				_.forEach(function(e) {
						var n = h.Attribute.unpack(r[0].attributes)[e];
						r.every(function(t) {
								var r = h.Attribute.unpack(t.attributes);
								return n = n === r[e] ? n : void 0
						}),
						n && t.format(e, n)
				})
		}
	}
	replace(t) {
		if (t.statics.blotName !== this.statics.blotName) {
				var n = Quill.create(this.statics.defaultChild);
				"ordered" !== t.statics.blotName && "bullet" !== t.statics.blotName && this.formatInlineBlock(t, n),
				t.moveChildren(n),
				this.appendChild(n)
		}
		t.domNode.getAttribute("data-header") && this.format("heading", t.domNode.getAttribute("data-header")),
		super.replace(t);
		var r = t.formats()["bullet-id"]
			, i = this.statics.formats(this.domNode);
		if (!r) {
				var o = function(e, t) {
						var n = e;
						for (; n && !M(n, t); ) {
								if (C(n, t))
										return;
								n = n.prev
						}
						if (void 0 === n)
								return;
						return n
				}(this.prev, i);
				if (o)
						r = O(o);
				else {
						var a = function(e, t) {
								var n = e;
								for (; n && !M(n, t); ) {
										if (C(n, t))
												return;
										n = n.next
								}
								if (void 0 === n)
										return;
								return n
						}(this.next, i);
						r = a ? O(a) : (0,
						d.default)(4)
				}
		}
		this.format("bullet-id", r)
	}

}
function O(e) {
	return e.children.tail.formats()["bullet-id"]
}
function S(e) {
	return e.statics.formats(e.domNode)
}
function C(e, t) {
	return function(e) {
			return e instanceof Block && "P" === e.domNode.tagName
	}(e) || e instanceof Container && !M(e, t)
}
function M(e, t) {
	return t ? e instanceof Bullet && S(e) === t : e instanceof Bullet
}
Bullet.blotName = 'bullet'
Bullet.tagName = "UL"
Bullet.defaultChild = "bullet-item"
Bullet.scope = Scope.BLOCK_BLOT
Bullet.allowedChildren = [BulletItem]
// Bullet.requiredContainer = BulletContainer

// BulletContainer.blotName = 'bullet-container'
// BulletContainer.className = 'ql-bullet-container'
// BulletContainer.allowedChildren = [Bullet]
// BulletContainer.scope = Scope.BLOCK_BLOT

export { BulletItem, Bullet as default };
