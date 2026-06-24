package com.axion.ingestion.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;

@Configuration
@ConditionalOnProperty(prefix = "axion.tsdb.datasource", name = "enabled", havingValue = "true", matchIfMissing = true)
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.axion.ingestion.repository.tsdb",
    entityManagerFactoryRef = "tsdbEntityManagerFactory",
    transactionManagerRef = "tsdbTransactionManager"
)
public class TsdbDataSourceConfig {

    @Bean(name = "tsdbDataSourceProperties")
    @ConfigurationProperties("axion.tsdb.datasource")
    public DataSourceProperties tsdbDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "tsdbDataSource")
    public DataSource tsdbDataSource(@Qualifier("tsdbDataSourceProperties") DataSourceProperties tsdbDataSourceProperties) {
        return tsdbDataSourceProperties.initializeDataSourceBuilder().build();
    }

    @Bean(name = "tsdbEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean tsdbEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("tsdbDataSource") DataSource tsdbDataSource) {
        return builder
                .dataSource(tsdbDataSource)
                .packages("com.axion.ingestion.model.tsdb")
                .persistenceUnit("tsdb")
                .build();
    }

    @Bean(name = "tsdbTransactionManager")
    public PlatformTransactionManager tsdbTransactionManager(
            @Qualifier("tsdbEntityManagerFactory") LocalContainerEntityManagerFactoryBean tsdbEntityManagerFactory) {
        return new JpaTransactionManager(tsdbEntityManagerFactory.getObject());
    }

    @Bean(name = "tsdbFlyway")
    public Flyway tsdbFlyway(@Qualifier("tsdbDataSource") DataSource tsdbDataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(tsdbDataSource)
                .locations("classpath:db/migration/tsdb")
                .baselineOnMigrate(true)
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean(name = "tsdbJdbcTemplate")
    public JdbcTemplate tsdbJdbcTemplate(@Qualifier("tsdbDataSource") DataSource tsdbDataSource) {
        return new JdbcTemplate(tsdbDataSource);
    }
}
