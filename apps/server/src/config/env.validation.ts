import { plainToInstance } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsPositive, IsString, Matches, MinLength, validateSync } from "class-validator";

enum NodeEnv {
    Development = "development",
    Test = "test",
    Production = "production",
}

/** Env schema, validated once at bootstrap via ConfigModule.forRoot({ validate }). */
class EnvironmentVariables {
    @IsEnum(NodeEnv)
    NODE_ENV: NodeEnv = NodeEnv.Development;

    @IsInt()
    @IsPositive()
    PORT: number = 4000;

    @IsString()
    @IsNotEmpty()
    ALLOWED_ORIGINS: string = "http://localhost:3000";

    @IsString()
    @Matches(/^postgresql:\/\//, { message: "DATABASE_URL must start with postgresql://" })
    DATABASE_URL!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(32, { message: "JWT_SECRET must be at least 32 characters long" })
    JWT_SECRET!: string;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        const message = errors
            .map((error) => Object.values(error.constraints ?? {}).join(", "))
            .join("; ");

        throw new Error(`Invalid environment variables: ${message}`);
    }

    return validatedConfig;
}

// .env.local for local dev, .env.test for tests, .env as the production/default fallback.
export function resolveEnvFilePath(): string {
    const nodeEnv = process.env.NODE_ENV;

    if (nodeEnv === "test") return ".env.test";
    if (nodeEnv === "development" || !nodeEnv) return ".env.local";
    return ".env";
}
