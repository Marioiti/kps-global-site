import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { routes } from "@/App";
import { allTranslations as translations } from "@/i18n/all-strings";
import { canon } from "@/data/canon";

const ENDPOINT = "https://formspree.io/f/test";

const renderAt = async (url: string) => {
  const router = createMemoryRouter(routes as RouteObject[], { initialEntries: [url] });
  render(
    <HelmetProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </HelmetProvider>,
  );
  await waitFor(() => expect(router.state.initialized).toBe(true));
  await screen.findAllByRole("heading", { level: 1 });
};

const en = translations.en;
const form = () => document.querySelector("main form") as HTMLFormElement;
const byName = (name: string) => form().querySelector(`[name="${name}"]`) as HTMLInputElement;
const fillValid = () => {
  fireEvent.change(byName("name"), { target: { value: "Ivan" } });
  fireEvent.change(byName("email"), { target: { value: "ivan@example.com" } });
  fireEvent.change(byName("need"), { target: { value: "offer-check" } });
  fireEvent.change(byName("message"), { target: { value: "Sulphur, 25,000 t, offer received" } });
  fireEvent.click(byName("consent"));
};
const submit = () => fireEvent.click(screen.getByRole("button", { name: en["contact.submit"] }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("contact page", () => {
  it("is the proposal request: heading, the form, what happens next and the direct channels", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", ENDPOINT);
    await renderAt("/contact/");
    expect(screen.getByRole("heading", { level: 1, name: en["contact.page.title"] })).toBeInTheDocument();
    // Source order is also the order on phones: heading, form, then the rest.
    const order = [...document.querySelectorAll("main h1, main form, main aside")].map((el) => el.tagName);
    expect(order).toEqual(["H1", "FORM", "ASIDE"]);
    const aside = document.querySelector("main aside") as HTMLElement;
    expect(within(aside).getAllByRole("listitem").map((li) => li.textContent)).toEqual([en["contact.next.1"], en["contact.next.2"], en["contact.next.3"]]);
    expect(within(aside).getByRole("link", { name: canon.contacts.email })).toHaveAttribute("href", `mailto:${canon.contacts.email}`);
    expect(within(aside).getByRole("link", { name: `${en["contact.openChat"]} WhatsApp` })).toHaveAttribute("href", canon.contacts.whatsapp!.url);
    expect(within(aside).getByRole("link", { name: `${en["contact.openChat"]} Telegram` })).toHaveAttribute("href", canon.contacts.telegram!.url);
  });

  it("shows the WeChat ID as text with a button that copies it", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", ENDPOINT);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    await renderAt("/contact/");
    const id = canon.contacts.wechat!;
    const aside = document.querySelector("main aside") as HTMLElement;
    expect(within(aside).getByText(id)).toBeInTheDocument();
    fireEvent.click(within(aside).getByRole("button", { name: `${en["contact.copy"]} ${en["contact.wechat"]} ${id}` }));
    expect(writeText).toHaveBeenCalledWith(id);
    expect(await within(aside).findByText(en["contact.copied"])).toBeInTheDocument();
  });
});

describe("contact form", () => {
  it.each([
    ["/contact/?service=compliance-kyc", "compliance-kyc", ""],
    ["/contact/?docs=offer-check", "offer-check", ""],
    ["/ru/contact/?docs=nda-form", "other", "Документы: Test NDA"],
    ["/contact/?mandate=KPS-M-2026-001", "deal-structuring", "Mandate KPS-M-2026-001"],
    ["/contact/?topic=Procedure%20form", "", "Procedure form"],
    ["/contact/?service=offer-check&commodity=sulphur", "offer-check", "Commodity: Sulphur"],
    ["/contact/?intent=proposal&service=fractional-coo", "fractional-coo", "Request for a proposal"],
    ["/zh/contact/?service=offer-check&commodity=unknown", "offer-check", ""],
  ])("prefills from %s", async (url, need, regarding) => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", ENDPOINT);
    await renderAt(url);
    await waitFor(() => expect(byName("need")).toHaveValue(need));
    expect(byName("regarding")).toHaveValue(regarding);
  });

  it("works as a plain POST to the form provider before scripts run", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", ENDPOINT);
    await renderAt("/contact/");
    expect(form()).toHaveAttribute("action", ENDPOINT);
    expect(form()).toHaveAttribute("method", "POST");
    for (const name of ["name", "email", "need", "message", "company", "role", "consent", "_gotcha", "regarding", "language", "page"]) {
      expect(byName(name), name).not.toBeNull();
    }
    expect(byName("name")).toBeRequired();
    expect(byName("company")).not.toBeRequired();
  });

  it("explains every missing field, links the message to its field and moves focus to the first one", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", ENDPOINT);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await renderAt("/contact/");
    submit();
    expect(await screen.findByText(en["contact.err.summary"])).toBeInTheDocument();
    for (const [name, key] of [["name", "contact.err.name"], ["email", "contact.err.email"], ["need", "contact.err.need"], ["message", "contact.err.message"], ["consent", "contact.err.consent"]]) {
      const input = byName(name);
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription(expect.stringContaining(en[key]));
    }
    expect(byName("name")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.change(byName("name"), { target: { value: "Ivan" } });
    fireEvent.change(byName("email"), { target: { value: "not an address" } });
    submit();
    await waitFor(() => expect(byName("email")).toHaveFocus());
    expect(byName("name")).not.toHaveAttribute("aria-invalid");
  });

  it("drops a submission that fills the honeypot without sending it", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", ENDPOINT);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await renderAt("/contact/");
    fillValid();
    fireEvent.change(byName("_gotcha"), { target: { value: "spam" } });
    submit();
    expect(await screen.findByText(en["contact.success"])).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows sending, then success in place of the form, and sends every field", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", ENDPOINT);
    let resolve: (value: { ok: boolean }) => void = () => {};
    const fetchMock = vi.fn(() => new Promise((r) => (resolve = r)));
    vi.stubGlobal("fetch", fetchMock);
    await renderAt("/contact/?mandate=KPS-M-2026-001");
    fillValid();
    fireEvent.change(byName("company"), { target: { value: "Acme Ltd" } });
    fireEvent.change(byName("role"), { target: { value: "project-owner" } });
    submit();

    const button = await screen.findByRole("button", { name: en["contact.submitting"] });
    expect(button).toBeDisabled();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
    expect(JSON.parse(init.body as string)).toMatchObject({
      name: "Ivan",
      email: "ivan@example.com",
      _replyto: "ivan@example.com",
      need: "offer-check",
      message: "Sulphur, 25,000 t, offer received",
      company: "Acme Ltd",
      role: "project-owner",
      regarding: "Mandate KPS-M-2026-001",
      language: "en",
      page: "/contact/",
      consent: true,
    });

    resolve({ ok: true });
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(en["contact.success"]);
    expect(status).toHaveTextContent(en["contact.successPrepare"]);
    expect(within(status).getByRole("img", { name: en["stamp.join"] })).toBeInTheDocument();
    expect(form()).toBeNull();

    // Another request: the form comes back, the address context stays.
    fireEvent.click(within(status).getByRole("button", { name: en["contact.another"] }));
    expect(form()).not.toBeNull();
    expect(byName("regarding")).toHaveValue("Mandate KPS-M-2026-001");
  });

  it("keeps the form and offers email when sending fails", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", ENDPOINT);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await renderAt("/contact/");
    fillValid();
    submit();
    const alert = await screen.findByText((_, el) => el?.getAttribute("role") === "alert" && !!el.textContent?.includes("was not sent"));
    expect(within(alert as HTMLElement).getByRole("link", { name: canon.contacts.email })).toHaveAttribute("href", `mailto:${canon.contacts.email}`);
    expect(screen.getByRole("button", { name: en["contact.submit"] })).toBeEnabled();
  });

  it("shows the email address instead of the button when the form endpoint is not set", async () => {
    vi.stubEnv("VITE_FORMSPREE_ENDPOINT", "");
    await renderAt("/ru/contact/");
    expect(screen.queryByRole("button", { name: translations.ru["contact.submit"] })).toBeNull();
    const withEmail = (text: string) => text.replace("{email}", canon.contacts.email);
    expect(screen.getByText(withEmail(translations.ru["contact.noForm"]))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: withEmail(translations.ru["contact.emailUs"]) })).toHaveAttribute("href", `mailto:${canon.contacts.email}`);
  });
});
