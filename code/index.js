var SVG_NS = 'http://www.w3.org/2000/svg';
var canvas = document.getElementById("canvas");


//图形及对应默认属性

var shapeInfo = {
  rect: "x:10,y:10,width:200,height:100,rx:0,ry:0",
  circle: 'cx:200,cy:200,r:50',
  ellipse: 'cx:200,cy:200,rx:80,ry:30',
  line: 'x1:10,y1:10,x2:100,y2:100',
}

//默认公共属性
var defaultAttrs = {
  fill: "#ffffff",
  stroke: '#ff0000'
}

var createForm = document.getElementById('create-shape');
var attrForm = document.getElementById('shape-attrs');
var lookForm = document.getElementById('look-and-transform');

//生成svg标签
var svg = createSVG();
//被选中的变量
var selected = null;

//左侧操作”创建“中的按钮点击添加监听
createForm.addEventListener('click', function(e) {
  if (e.target.tagName.toLowerCase() === "button") {
    create(e.target.getAttribute('create'))
  }
});

/**
 * 监听”形状“操作的输入
 */
attrForm.addEventListener('input', function(e) {
  if (e.target.tagName.toLowerCase() != 'input') return;
  var handle = e.target;
  selected.setAttribute(handle.name, handle.value);
});

//监听”外观和变化“中的input的变化事件
lookForm.addEventListener('input', function(e) {
  if (e.target.tagName.toLowerCase() != 'input') return;
  if (!selected) return;
  selected.setAttribute('fill', fill.value);
  selected.setAttribute('stroke', stroke.value);
  selected.setAttribute('stroke-width', strokeWidth.value);
  selected.setAttribute('transform', encodeTranform({
    tx: translateX.value,
    ty: translateY.value,
    scale: scale.value,
    rotate: rotate.value
  }));
});


//创建SVG的公共方法
function createSVG() {
  //createElementNS(ns, name) : 方法可创建带有指定命名空间的元素节点。
  //ns : 命名空间，name创建的节点名
  var svg = document.createElementNS(SVG_NS, 'svg')

  //设置属性setAttribute
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  //在div#canvas中插入svg
  canvas.appendChild(svg);

  //在svg上添加点击事件的监听
  svg.addEventListener('click', function(e) {
    if (e.target.tagName.toLowerCase() in shapeInfo) {
      select(e.target)
    }
  })

  //返回svg
  return svg;

}

//创建SVG中的图形
function create(name) {
  var shape = document.createElementNS(SVG_NS, name);
  svg.appendChild(shape);
  select(shape)
}

//给选中的图形附加属性
function select(shape) {
  //从shapeInfo中找到对应的图形的属性并拆分成数组
  var attrs = shapeInfo[shape.tagName].split(',');

  var attr, name, value;

  //将左侧操作栏中”图形“下的内容清空
  attrForm.innerHTML = "";

  while (attrs.length) {
    //shift()从开始截取数组，返回截取的数据，会改变数组
    attr = attrs.shift().split(':');
    name = attr[0];
    value = shape.getAttribute(name) || attr[1];
    //创建左侧中的”图形“操作栏并赋值
    createHandle(name, value);
    //给图形附加属性
    shape.setAttribute(name, value)

    //这里是另外两个属性是否要赋值
    for (name in defaultAttrs) {
      value = shape.getAttribute(name) || defaultAttrs[name];
      shape.setAttribute(name, value)
    }

    //selected赋值选中的图形对象
    selected = shape;

    //更新操作栏中的”外观和变换“
    updateLookHandle();
  }
}

/**
 * 生成左侧操作中”形状“中的各个属性的控制杆
 * @param {属性名} name 
 * @param {属性的值} value 
 */
function createHandle(name, value) {
  var label = document.createElement('label');
  label.textContent = name;

  var handle = document.createElement('input');
  handle.setAttribute('name', name);
  handle.setAttribute('type', 'range');
  handle.setAttribute('value', value);
  handle.setAttribute('min', 0);
  handle.setAttribute('max', 800);

  attrForm.appendChild(label);
  attrForm.appendChild(handle);
}

/**
 * 操作”外观和变换“时，更新图形中的属性或形状
 */
function updateLookHandle() {
  fill.value = selected.getAttribute('fill');
  stroke.value = selected.getAttribute('stroke');
  var t = decodeTransform(selected.getAttribute('transform'));
  translateX.value = t ? t.tx : 0;
  translateY.value = t ? t.ty : 0;
  rotate.value = t ? t.rotate : 0;
  scale.value = t ? t.scale : 1;
}

/**
 * 获取translate的属性值
 * @param {*} transString 
 */
function decodeTransform(transString) {
  var match = /translate\((\d+),(\d+)\)\srotate\((\d+)\)\sscale\((\d+)\)/.exec(transString);
  return match ? {
    tx: +match[1],
    ty: +match[2],
    rotate: +match[3],
    scale: +match[4]
  } : null;
}

/**
 * 生成translate属性字符串
 * @param {*} transObject 
 */
function encodeTranform(transObject) {
  return ['translate(', transObject.tx, ',', transObject.ty, ') ',
    'rotate(', transObject.rotate, ') ',
    'scale(', transObject.scale, ')'
  ].join('');
}