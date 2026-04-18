plugins {
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
    kotlin("jvm") version "1.9.20"
    kotlin("plugin.spring") version "1.9.20"
    kotlin("plugin.jpa") version "1.9.20"
}

group = "com.ds3"
version = "1.0.0"

java {
    sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

extra["kotlin-coroutines.version"] = "1.7.3"

dependencies {
    // Spring Boot Starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    
    // Kotlin
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    
    // Database
    runtimeOnly("org.postgresql:postgresql")
    
    // Kafka
    implementation("org.springframework.kafka:spring-kafka")
    
    // CSV Processing
    implementation("com.opencsv:opencsv:5.8")
    
    // HTTP Clients
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("io.github.resilience4j:resilience4j-spring-boot2:2.1.0")
    
    // GraphQL
    implementation("com.graphql-java-kickstart:graphql-spring-boot-starter-webmvc:15.0.0")
    implementation("com.graphql-java-kickstart:graphql-java-tools:13.0.0")
    
    // Debezium
    implementation("io.debezium:debezium-connector-postgresql:2.5.0.Final")
    implementation("io.debezium:debezium-embedded:2.5.0.Final")
    
    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.kafka:spring-kafka-test")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "17"
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
