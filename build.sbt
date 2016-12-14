name := """mine-sweeper-web"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava, SbtWeb)


scalaVersion := "2.11.7"

libraryDependencies ++= Seq(
  javaJdbc,
  cache,
  javaWs,
  filters,
  "org.webjars" % "bootstrap" % "3.3.4",
  "org.webjars" % "jquery" % "2.1.4",
  "org.webjars" % "font-awesome" % "4.7.0"
)


includeFilter in (Assets, LessKeys.less) := "*.less" | "utils/*.less"
excludeFilter in (Assets, LessKeys.less) := "_*.less"

fork in run := false