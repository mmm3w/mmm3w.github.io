---
title: 设计模式之适配器模式
date: 2019-05-01 00:00:00
tags:
---

### 适配器模式

##### 个人理解

适配器，就是适配两个不兼容的东西，将一个类的接口转换成客户期望的另一个接口。适配器让原本接口不兼容的类合作无间
分对象适配器和类适配器，类适配器只能在能够多继承的语言上实现。
适配器模式更多的作用是 **转换**

<!--more-->

##### 示例代码

简单对象适配器
通过适配器使fun()方法转换成了function()方法

```java
interface abs{
  void function();
}

class Client1 implements abs{
  void function(){
    sout("11111");
  }
}

class Client2 {
  void fun(){
    sout("222");
  }
}

class Adapter implements abs{
  Client2 client2;
  Adapter(Client2 client2){
    this.client2 = client2;
  }
  void function(){
    client2.fun();
  }
}

void test(){
  abs client1 = new Client1();
  client1.function();
  abs client2 = new Adapter(new Client2());
  client2.function();
}
```
