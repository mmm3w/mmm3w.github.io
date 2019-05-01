---
title: 设计模式之单例模式
date: 2019-05-01 00:00:00
tags:
---
### 单例模式

##### 个人理解

如其名，一个类只有一个实例，并提供一个全局访问点。但是单例注意点有很多。1、要注意经典单例多线程中getInstance()可能会创建多个实例。2、使用synchronized修饰getInstance()会导致性能问题
<!--more-->
##### 示例代码

经典单例
存在多线程多实例问题

```java
public class Singleton{
  private static Songleton uniqueInstance;
  private Singleton(){
  }
  public static Singleton getInstance(){
    if (null == uniqueInstance) {
      uniqueInstance = new Singleton();
    }
    return uniqueInstance;
  }
}
```

拥有线程同步的单例
能够解决经典单例中问题，但是会有性能问题
如果getInstance()的性能对程序不是很关键，可以使用这种方法

```java
public class Singleton{
  private static Songleton uniqueInstance;
  private Singleton(){
  }
  public static synchronized Singleton getInstance(){
    if (null == uniqueInstance) {
      uniqueInstance = new Singleton();
    }
    return uniqueInstance;
  }
}
```

放弃懒加载的单例

```java
public class Singleton{
  private static Songleton uniqueInstance = new Singleton();
  private Singleton(){
  }
  public static synchronized Singleton getInstance(){
    return uniqueInstance;
  }
}
```

双重检查加锁单例
减少同步使用，增加性能

```java
public class Singleton{
  private volatile static Songleton uniqueInstance;
  private Singleton(){
  }
  public static Singleton getInstance(){
    if (null == uniqueInstance) {
      synchronized (Singleton.class){
        if (null == uniqueInstance) {
          uniqueInstance = new Singleton();
        }
      }
    }
    return uniqueInstance;
  }
}
```
