# 基础vim

## vim起步

命令 | 左右
:- | :-
`i`  | 进入编辑模式
`I`  | 行首插入
`a`  | 在光标后面开始输入文字
`A`  | 行尾插入
`o`  | 新起一行输入文字
`O`  | 在上一行插入
`v`  | 批量操作
`V`  | 整行的选中
`control + v`  | 块状操作


### 快速纠错

命令 | 描述
:- |:-
`ctrl + h` | 删除上一个字符
`ctrl + w` | 删除上一个单词
`ctrl + u` | 删除当前行
`ctrl + a` | 行首
`ctrl + b` | 行尾
`gi` | 快速回到最后一次编辑的地方并且插入


### vim快速移动
`hjkl`

命令 | 描述
:- | :-
`w/W` | 移动到下一个 word/WORD 开头
`e/E` | 移动到下一个 word/WORD 尾
`b/B` | 回到上一个 word/WORD 开头

word指的是非空白分隔符的单词， WORD 以空白分隔符的单词

### 行间搜索移动
使用 `f{char}`可以移动到char字符上， t移动到char 的前一个字符
如果一次有搜索到， 可以用分号 `;` 或者 `,` 继续搜索改行下一个/上一个


### 水平移动

命令 | 描述
:- | :-
`0` | 移动到行首
`$` | 移动到行尾
`^` | 移动到第一个非空白字符
`g_` | 移动到行尾非空白字符


### 页面移动

命令 | 描述
:- | :-
`gg` | 文件开头
`G` | 文件结尾
`H/M/L` | 快速跳转到屏幕的开头、中间和结尾
`ctrl + u / crtl + f` | 上下翻页
`zz` | 把屏幕设置为中间


### 快速正删改查
**增加字符**： i/a/o

**快速删除**： 如何删除一个字符和单词呢？
- `normal` 模式下 `x` 快速删除一个字符
- `normal` 模式下 `d` 快速删除一个单词
- `normal` 模式下 `daw` 删除一个单词
- `normal` 模式下面 `dd` 可以删除一个行
- `normal` 模式下 `dt*` 表示删除某段内容， 直到 * 为止

其中 x 和 d 都是可以搭配数字一起是用。
比如 `2d` 表示删除两行 。 `4x` 表示删除四个服

**修改**: 删除之后改为我们希望的文本内容

`r(replace)/c(change)/s(substitute)`: r可以替换一个字符， s 替换并且插入模式， c 配合文本对象快速修改内容
`R`: 可以不断的替换当前字符

最常用的就是 `c` 的操作

**查询操作**:
`/ 或者 ？` | 前向或者反向查询
`n 或者 N ` | 跳转到下一个或者上一个匹配
`* 或者 # ` | 单词的前向或者后巷匹配


### 搜索替换
命令：`:[range]s[ubstitute]/{pattern}/{string}/[flags]`
- range 表示范围， 比如: 10, 20 表示10-20行， % 表示全部
- pattern 表示要替换的欧式
- string 表示替换后的文本
- flags
    - g(global)表示全局范围内执行
    - c(confirm)表示缺人，可以缺人或者拒绝修改
    - n(number)报告匹配到的次数而不替换， 可以用来查询匹配次数

例如需要把文本中的`self`替换为`this`: `:% s/self/this/g`
例如我们需要精准替换： `:% s/\<quack\>/main/g`


### 撤销与反撤销

命令 | 描述
:- |:-
`u` | 撤销操作
`ctrl + r` | 撤销 上一步的撤销操作


### 多文件操作
有几个相关概念： Buffer、窗口、Tab
作为了解作用 ...... 如果以后需要使用再了解就OK


### text-Object
语法命令： `[number]<command>[text object]`
number 表示次数、command 是命令， d(delete)、c(change)、y(yank)
text object 是要操作的文本对象， 比如单词w, 句子s, 段落p

示例：
`viw` - 选中单词
`vaw` - 选中单词也会选中空格
`vi"` - 就可以快速选中双引号内的内容
`ci"` - 快速删除双引号中的内容， 并且进入插入模式

**记住四个常用命令**
d - 删除
c - 修改并且插入
v - 选中
y - 复制


### 复制、剪切、粘贴

命令 | 描述
:- |:-
`y` | 复制
`yy` | 复制一行
`d` | 剪切
`p` | 粘贴


### 宏macro
可以看做一些列命令的结合
使用 q 来录制命令， 再次使用 q 结束录制
使用 `q{register}` 选择需要保存的寄存器
使用 `@{register}` 回放命令

例如要给所有的url 加上双引号的需求：
`q a` --> `I` --> 插入行首输入引号 -->  `A` --> 移动行尾， 输入引号 --> `q`

选中所有行， 输入进入 normal 模式， `normal @a` 回车就可以了


### 补全
`ctrl + n / ctrl + p` - 补全单词
`ctrl + x / ctrl + f` - 补全文件名
`ctrl + x / ctrl + o` - 补全代码(需要开启文件类型检测， 安装插件)


### 其他命令

命令 | 描述
:- |:-
`:syntax on` | 打开高亮
`:set nu` | 打开行数统计
`:set hls` | 搜索结果高亮
`:set incsearch` | 可以一边搜索一边高亮
`:ctrl + t` | 可以回放上一个命令














# 面试官：说说 linux 系统下 文本编辑常用的命令有哪些？

 ![](https://static.vue-js.com/1062b8b0-049b-11ec-8e64-91fdec0f05a1.png)

## 一、是什么

`Vim`是从 `vi` 发展出来的一个文本编辑器，代码补全、编译及错误跳转等方便编程的功能特别丰富，在程序员中被广泛使用。

简单的来说， `vi` 是老式的字处理器，不过功能已经很齐全了，但是还是有可以进步的地方

而`vim `可以说是程序开发者的一项很好用的工具



## 二、使用

基本上 vi/vim 共分为三种模式，分别是：

- 命令模式（Command mode）
- 输入模式（Insert mode）
- 底线命令模式（Last line mode）

 ![](https://static.vue-js.com/265a0080-03d6-11ec-a752-75723a64e8f5.png)



### 命令模式

`Vim` 的默认模式，在这个模式下，你不能输入文本，但是可以让我们在文本间移动，删除一行文本，复制黏贴文本，跳转到指定行，撤销操作，等等



#### 移动光标

常用的命令如下：

- h 向左移动一个字符
- j 向下移动一个字符
- k 向上移动一个字符
- i 向右移动一个字符

或者使用方向键进行控制

如果想要向下移动`n`行，可通过使用 "nj" 或 "n↓" 的组合按键



#### 搜索

常见的命令如下：

- /word：向光标之下寻找一个名称为 word 的字符

- ?word：向光标之上寻找一个字符串名称为 word 的字符串
- n：代表重复前一个搜寻的动作，即再次执行上一次的操作
- N：反向进行前一个搜索动作





#### 删除、复制、粘贴

常用的命令如下：

- x：向后删除一个字符
- X：向前删除一个字符
- nc：n 为数字，连续向后删除 n 个字符
- dd：删除游标所在的那一整行
- d0：删除游标所在处，到该行的最前面一个字符
- d$删除游标所在处，到该行的最后一个字符
- ndd：除光标所在的向下 n 行
- yy：复制游标所在的那一行
- y0：复制光标所在的那个字符到该行行首的所有数据
- y$：复制光标所在的那个字符到该行行尾的所有数据
- p：已复制的数据在光标下一行贴上
- P：已复制的数据在光标上一行贴上
- nc：重复删除n行数据



### 输入模式

命令模式通过输入大小写`i`、`a`、`o`可以切换到输入模式，如下：

- i：从目前光标所在处输入
- I：在目前所在行的第一个非空格符处开始输入
- a：从目前光标所在的下一个字符处开始输入
- A：从光标所在行的最后一个字符处开始输入
- o：在目前光标所在的下一行处输入新的一行
- O：目前光标所在的上一行处输入新的一行

输入模式我们熟悉的文本编辑器的模式，就是可以输入任何你想输入的内容

如果想从插入模式回到命令模式，使用按下键盘左上角的`ESC`键





### 底线命令模式

这个模式下可以运行一些命令例如“退出”，“保存”，等动作，为了进入底线命令模式，首先要进入命令模式，再按下冒号键：

常见的命令如下：

- w：将编辑的数据写入硬盘档案中
- w!：若文件属性为『只读』时，强制写入该档案
- q：未修改，直接退出
- q!：修改过但不存储
- wq：储存后离开



## 参考文献

- https://www.runoob.com/linux/linux-vim.html