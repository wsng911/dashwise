import ConfigWrapper from "@/components/ConfigWrapper";

export default function 设置RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigWrapper>
      {children}
    </ConfigWrapper>
  );
}
