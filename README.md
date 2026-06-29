BU PROJE HAKKINDA; 
[TR] 
Bu proje, yapay zeka ajanlarının (AI Agents) otonom olarak veri şemaları üretebilmesi, durum yönetimini (state management) sürdürebileceği ve standart bir protokol üzerinden dış dünyayla konuşabileceği kurumsal düzeyde bir Agentic Backend-as-a-Service (BaaS) altyapısıdır. Projenin bu ilk aşamasında (PoC) aşağıdaki temel bileşenler başarıyla hayata geçirilmiştir:

Kod-Öncelikli (Code-First) Altyapı: TypeScript dekoratörleri (@entity, @text, @boolean) kullanılarak veri modelleri saf kod yapısıyla tanımlandı.

Dinamik Şema Çözümleyici (Core Engine): Çalışma zamanında (runtime) bu dekoratörleri analiz eden ve yerel Docker ortamındaki PostgreSQL (Azure HorizonDB simülasyonu) üzerinde otomatik olarak SQL tabloları (CREATE TABLE IF NOT EXISTS) oluşturan şema senkronizasyon motoru yazıldı.

Model Context Protocol (MCP) Entegrasyonu: Anthropic'in resmi @modelcontextprotocol/sdk paketi entegre edilerek, veritabanı operasyonları yapay zeka ajanlarının doğrudan anlayabileceği standart JSON-RPC (Stdio) araçlarına (Tools) dönüştürüldü.

Geriye Dönük HTTP Katmanı: Ajanlar ve harici sistemler için dinamik veri yazmayı (INSERT) otomatikleştiren Express.js tabanlı mutasyon API'leri kuruldu.

Simülasyon ve Test: Geliştirilen mimari, resmi MCP Inspector aracılığıyla test edilerek yapay zeka ajanlarının bu altyapıyı bir araç olarak başarıyla algıladığı doğrulandı.

ABOUT THIS PROJECT;
[EN]
This repository contains an enterprise-grade Agentic Backend-as-a-Service (BaaS) infrastructure designed for autonomous AI agents to manage database schemas, state preservation, and communication via standard protocols. In this initial phase (PoC), the following core capabilities have been successfully implemented:

Code-First Architecture: Defined relational data models using pure TypeScript decorators (@entity, @text, @boolean).

Dynamic Schema Synchronizer (Core Engine): Developed a runtime engine that parses metadata and automatically generates/synchronizes SQL schemas inside a local Dockerized PostgreSQL instance (simulating Azure HorizonDB).

Model Context Protocol (MCP) Integration: Integrated the official @modelcontextprotocol/sdk to expose database mutations as standardized JSON-RPC (Stdio) tools that LLM agents can autonomously discover and execute.

Hybrid HTTP Layer: Built an Express.js server providing dynamic entry points for programmatic data mutation and client-agent discovery.

Testing & Inspection: Verified the infrastructure using the MCP Inspector, proving that the custom server successfully registers and executes tools under the MCP standard.