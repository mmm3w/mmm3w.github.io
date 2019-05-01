---
title: 设计模式之装饰者模式
date: 2019-05-01 00:00:00
tags:
---

### 装饰者模式

##### 个人理解

创建了一个类来包装原有的类，在保证原有类的不变的情况下，提供了额外的功能（如人的首饰一样，在不改变人原有的面貌的情况下，提高人的一些气质）。
动态地将责任附加在对象上，若要扩展功能， 装饰者提供了比继承更有弹性地替代方案。

装饰器要继承与对象一样地抽象基类或者实现一样的接口（抽象基类与接口均可，尽量努力避免修改现有的代码）
<!--more-->
##### 示例代码

```java
//原始抽象类
public abstract class Beverage{
  String des = "Unknown";
  public String getDes(){
    return des;
  }
  public abstract double cost();
}

//抽象装饰类
public abstract class CondimentDecorator extends Beverage{
  public abstract String getDes();
}

//实现类 1
public class Espresso extends Beverage{
  public Espresso(){
    des = "Espresso";
  }
  public double cost(){
    return 1.99;
  }
}

//实现类 2
public class HouseBlend extends Beverage{
  public HouseBlend(){
    des = "HouseBlend";
  }
  public double cost(){
    return 0.89;
  }
}

//装饰类 1
public class Mocha extends CondimentDecorator{
  Beverage beverage;
  public Mocha(Beverage beverage){
    this.beverage = beverage;
  }
  public String getDes(){
    return beverage.getDes() + ",Mocha";
  }
  public double cost(){
    return beverage.cost() + 0.2;
  }
}

//装饰类 2
public class Soy extends CondimentDecorator{
  Beverage beverage;
  public Soy(Beverage beverage){
    this.beverage = beverage;
  }
  public String getDes(){
    return beverage.getDes() + ",Soy";
  }
  public double cost(){
    return beverage.cost() + 0.4;
  }
}

//装饰类 3
public class Whip extends CondimentDecorator{
  Beverage beverage;
  public Whip(Beverage beverage){
    this.beverage = beverage;
  }
  public String getDes(){
    return beverage.getDes() + ",Whip";
  }
  public double cost(){
    return beverage.cost() + 0.5;
  }
}

void test(){
  Beverage beverage = new Espresso();
  beverage.getDes();
  beverage.cost();

  Beverage beverage2 = new HouseBlend();
  beverage2 = new Mocha(beverage2);
  beverage2 = new Soy(beverage2);
  beverage2 = new Whip(beverage2);
  beverage2.getDes();
  beverage2.cost();
}
```
