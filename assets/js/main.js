/** drop target **/
var _target = document.getElementById('drop');
var _file = document.getElementById('file');
var _grid = document.getElementById('grid');

/** Spinner **/
var spinner;

var _workstart = function() { spinner = new Spinner().spin(_target); }
var _workend = function() { spinner.stop(); }

/** Alerts **/
var _badfile = function() {
    alertify.alert('此文件似乎不是有效的Excel文件。', function(){});
};

var _pending = function() {
    alertify.alert('请等待当前文件被处理 ...', function(){});
};

var _large = function(len, cb) {
    alertify.confirm("这个文件大小为： " + len + " bytes，可能会花费很长时间。</br>在此过程中，浏览器可能会锁定。</br>是否继续读取此文件？", cb);
};

var _failed = function(e) {
    console.log(e, e.stack);
    alertify.alert(e.stack+ '很不幸，我们打开失败了。', function(){});
};

/* 为工作表生成 button */
var make_buttons = function(sheetnames, cb) {
    var buttons = document.getElementById('buttons');
    buttons.innerHTML = "";
    sheetnames.forEach(function(s,idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.name = 'btn' + idx;
        btn.text = s;
        var txt = document.createElement('h3'); txt.innerText = s; btn.appendChild(txt);
        btn.addEventListener('click', function() { cb(idx); }, false);
        buttons.appendChild(btn);
        buttons.appendChild(document.createElement('br'));
    });
};

var cdg = canvasDatagrid({
    parentNode: _grid
});
cdg.style.height = '100%';
cdg.style.width = '100%';

function _resize() {
    _grid.style.height = (window.innerHeight - 200) + "px";
    _grid.style.width = (window.innerWidth - 200) + "px";
}
window.addEventListener('resize', _resize);

var _onsheet = function(json, sheetnames, select_sheet_cb) {
    document.getElementById('footnote').style.display = "none";

    //make_buttons(sheetnames, select_sheet_cb);

    /* 显示 grid */
    _grid.style.display = "block";
    _resize();

    /* 设置表头 */
    var L = 0;
    json.forEach(function(r) {
      if(L < r.length) L = r.length;
    });
    console.log(L);
    for(var i = json[0].length; i < L; ++i) {
        json[0][i] = "";
    }
    for (var i = 0; i < json[0].length; i ++){
        var pos = json[0][i].indexOf("（无下拉框）");
        if (pos > -1)
          json[0][i] = json[0][i].substring(0, pos);
    }
    console.log("json[0]: " + json[0]);
    console.log("json[0] type: " + typeof json[0]);

    /* 处理数据 */
    var insert_pos = 0;
    for (var i = 0; i < json[0].length; i ++) {
        if (json[0][i] === "定性"){
            insert_pos = i + 1;
            json[0].splice(insert_pos, 0 , "定性关键词");
        }
    }
    console.log("json[0]: " + json[0]);
    for (var i = 1; i < json.length; i ++){
        json[i].splice(insert_pos, 0 , "");
        for (var j = 0; j < dx_keys.length; j ++)
            if (json[i][insert_pos-1].indexOf(dx_keys[j])> -1)
                json[i][insert_pos] += dx_keys[j]+"; ";

        if (json[i][json[i].length-1] === "1")
            json[i][L] = "大学";
        else if (json[i][json[i].length-1] === "2")
            json[i][L] = "研究机构"
    }

    /* 加载数据 */
    cdg.data = json;
};

/** Drop it like it's hot **/
DropSheet({
  file: _file,
  drop: _target,
  on: {
    workstart: _workstart,
    workend: _workend,
    sheet: _onsheet,
    foo: 'bar'
  },
  errors: {
    badfile: _badfile,
    pending: _pending,
    failed: _failed,
    large: _large,
    foo: 'bar'
  }
});
