# Flying Cards

> 原力甩卡

如果开两个网页，就可以来回传送卡片。

如果拿两台手机，都打开这个网站，也可以来回传送卡片。

## Demo

http://flyingcards.fastbreakfast.top/

## Preview

虽然原理很简单，但是我觉得这个效果很有趣。

**可以看一下效果动图，图太大了，就不放到仓库里了**

[效果动图](http://tulu.fastbreakfast.top/flying_cards.gif)

## Usage

- 项目由两个部分组成：
    - 前端react：用来显示卡片的动效 (FlyingCards/react-cards)
    - 后端Django：用Websockets来模拟传输 (FlyingCards/mysite)
- 修改react-cards/src/index.js 里的 cards 就可以修改图片
- mysite是直接通过修改[Channels](https://channels.readthedocs.io/en/latest/tutorial/part_1.html)的教程完成的。所以连名字都没改。
- 可以通过修改mysite/chat/consumers.py完成Websockets的一些修改。

## Installation

**首先，你需要安装一个redis**


```
git clone https://github.com/GavBaros/react-tinder-cards.git
cd Flying-Cards/react-cards
npm install
npm start

# 再开一个终端，或者把npm start放到后台

cd Flying-Cards/mysite
mkvirtualenv flyingcards
pip install -r requirements.txt
python3 manage.py runserver

# 修改 Flying-Cards/react-cards/src/index.js 里 150行 domin 为自己的地址
# 直接打开 http://localhost:3006/
# 或者部署
```

## Acknowledgements

- 感谢[react-spring](https://www.react-spring.io/)和[react-use-gesture](https://use-gesture.netlify.com/)
- 本项目主要是基于 react-spring 和 react-use-gesture 的卡片demo 改造来的。
- 感谢[react-tinder-cards](https://github.com/GavBaros/react-tinder-cards)