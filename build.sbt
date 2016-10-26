name := """mine-sweeper-web"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.11.7"

libraryDependencies ++= Seq(
  javaJdbc,
  cache,
  javaWs
)

includeFilter in (Assets, LessKeys.less) := "utils/*.less"

fork in run := false