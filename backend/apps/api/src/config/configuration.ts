export interface AppConfig {
  port: number;
}

export default (): { app: AppConfig } => ({
  app: {
    port: parseInt(process.env.PORT ?? '4000', 10),
  },
});
